import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

import {
  cancelRegistration,
  getMyRegistrations,
} from '../api/registrationApi';
import { getCourseById } from '../api/courseApi';

import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

import type { Registration } from '../types/registration';

interface RegistrationView {
  registration: Registration;
  courseName: string;
}

export default function MyRegistrationsPage() {
  const [items, setItems] = useState<RegistrationView[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    toast,
    showToast,
    clearToast,
  } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const registrationResponse =
        await getMyRegistrations();

      const activeRegistrations =
        registrationResponse.data.filter(
          (registration) =>
            registration.trangThai === 'DA_DANG_KY'
        );

      const data = await Promise.all(
        activeRegistrations.map(
          async (registration) => {
            try {
              const courseResponse =
                await getCourseById(
                  registration.courseId
                );

              return {
                registration,
                courseName:
                  courseResponse.data.tenMonHoc,
              };
            } catch {
              return {
                registration,
                courseName:
                  `Mon hoc #${registration.courseId}`,
              };
            }
          }
        )
      );

      setItems(data);
    } catch (err) {
      let message =
        'Khong tai duoc danh sach hoc phan';

      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          message = err.response.data.message;
        }
      }

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCancel = async (
    registration: Registration
  ) => {
    const confirmed = window.confirm(
      'Ban co chac muon huy dang ky hoc phan nay?'
    );

    if (!confirmed) {
      return;
    }

    try {
      await cancelRegistration(registration.id);

      showToast(
        'Huy dang ky hoc phan thanh cong',
        'success'
      );

      await loadData();
    } catch (err) {
      let message =
        'Huy dang ky hoc phan that bai';

      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          message = err.response.data.message;
        }
      }

      showToast(message, 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Hoc phan cua toi</h1>
        <p>Dang tai du lieu...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Hoc phan cua toi</h1>

        <p style={{ color: '#b91c1c' }}>
          {errorMessage}
        </p>

        <button onClick={loadData}>
          Thu lai
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Hoc phan cua toi</h1>

      {items.length === 0 ? (
        <p>Ban chua dang ky hoc phan nao.</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr
              style={{
                textAlign: 'left',
                borderBottom: '2px solid #333',
              }}
            >
              <th>Ten mon hoc</th>
              <th>Ngay dang ky</th>
              <th>Trang thai</th>
              <th>Thao tac</th>
            </tr>
          </thead>

          <tbody>
            {items.map(
              ({ registration, courseName }) => (
                <tr
                  key={registration.id}
                  style={{
                    borderBottom:
                      '1px solid #eee',
                  }}
                >
                  <td>{courseName}</td>

                  <td>
                    {new Date(
                      registration.ngayDangKy
                    ).toLocaleDateString('vi-VN')}
                  </td>

                  <td>
                    {registration.trangThai}
                  </td>

                  <td>
                    <button
                      onClick={() =>
                        handleCancel(
                          registration
                        )
                      }
                      style={{
                        color: '#b91c1c',
                      }}
                    >
                      Huy dang ky
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={clearToast}
        />
      )}
    </div>
  );
}