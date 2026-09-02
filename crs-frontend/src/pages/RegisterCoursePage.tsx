import { useState } from 'react';
import axios from 'axios';

import { useCourses } from '../api/useCourses';
import { registerCourse } from '../api/registrationApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

import SearchBox from '../components/SearchBox';
import CourseList from '../components/CourseList';
import Pagination from '../components/Pagination';
import Toast from '../components/Toast';

import type { Course } from '../types/course';

export default function RegisterCoursePage() {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [registeringId, setRegisteringId] =
    useState<number | null>(null);

  const {
    courses,
    totalPages,
    state,
    errorMessage,
    refetch,
  } = useCourses(keyword, page);

  const { user } = useAuth();

  const {
    toast,
    showToast,
    clearToast,
  } = useToast();

  const handleSearch = (value: string) => {
    setKeyword(value);
    setPage(0);
  };

  const handleRegister = async (course: Course) => {
    if (!user) {
      return;
    }

    try {
      setRegisteringId(course.id);

      await registerCourse({
        studentId: user.id,
        courseId: course.id,
      });

      showToast(
        'Dang ky hoc phan thanh cong',
        'success'
      );

      refetch();
    } catch (err) {
      let message = 'Dang ky hoc phan that bai';

      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          message = err.response.data.message;
        }
      }

      showToast(message, 'error');
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Dang ky hoc phan</h1>

      <div style={{ marginBottom: 20 }}>
        <SearchBox
          onSearch={handleSearch}
          placeholder="Tim kiem mon hoc..."
        />
      </div>

      <CourseList
        courses={courses}
        state={state}
        errorMessage={errorMessage}
        onRetry={refetch}
        onRegister={handleRegister}
        registeringId={registeringId}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

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