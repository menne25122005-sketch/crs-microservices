import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from 'react';

import {
  createApiKey,
  getApiKeys,
  revokeApiKey,
} from '../api/apiKeyApi';

import type { ApiKey } from '../types/apiKey';

function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [ownerName, setOwnerName] = useState('');
  const [scopes, setScopes] = useState('courses:read');
  const [validDays, setValidDays] = useState(30);

  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadApiKeys = useCallback(async () => {
    try {
      const response = await getApiKeys();
      setApiKeys(response.data);
      setError('');
    } catch {
      setError('Không thể tải danh sách API Key');
    }
  }, []);

  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await createApiKey({
        ownerName,
        scopes,
        validDays,
      });

      setNewKey(response.data.keyValue);
      setOwnerName('');
      setScopes('courses:read');
      setValidDays(30);
      setError('');

      await loadApiKeys();
    } catch {
      setError('Không thể tạo API Key');
    }
  };

  const handleRevoke = async (id: number) => {
    const confirmed = window.confirm(
      'Bạn có chắc muốn thu hồi API Key này?'
    );

    if (!confirmed) {
      return;
    }

    try {
      await revokeApiKey(id);
      await loadApiKeys();
    } catch {
      setError('Không thể thu hồi API Key');
    }
  };

  return (
    <div>
      <h2>Quản lý API Key</h2>

      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      <form onSubmit={handleCreate}>
        <div>
          <label>Tên đối tác</label>
          <br />
          <input
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Scopes</label>
          <br />
          <input
            type="text"
            value={scopes}
            onChange={(e) => setScopes(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Số ngày hiệu lực</label>
          <br />
          <input
            type="number"
            min="1"
            value={validDays}
            onChange={(e) =>
              setValidDays(Number(e.target.value))
            }
            required
          />
        </div>

        <br />

        <button type="submit">
          Tạo API Key
        </button>
      </form>

      {newKey && (
        <div>
          <h3>API Key mới</h3>

          <p>
            Hãy sao chép và lưu API Key này ngay.
            Key chỉ được hiển thị sau khi tạo.
          </p>

          <code>{newKey}</code>
        </div>
      )}

      <hr />

      <h3>Danh sách API Key</h3>

      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Đối tác</th>
            <th>Scopes</th>
            <th>Trạng thái</th>
            <th>Ngày hết hạn</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {apiKeys.map((apiKey) => (
            <tr key={apiKey.id}>
              <td>{apiKey.id}</td>
              <td>{apiKey.ownerName}</td>
              <td>{apiKey.scopes}</td>
              <td>{apiKey.status}</td>

              <td>
                {apiKey.expiresAt
                  ? new Date(
                      apiKey.expiresAt
                    ).toLocaleString()
                  : 'Không giới hạn'}
              </td>

              <td>
                {new Date(
                  apiKey.createdAt
                ).toLocaleString()}
              </td>

              <td>
                {apiKey.status === 'ACTIVE' && (
                  <button
                    type="button"
                    onClick={() =>
                      handleRevoke(apiKey.id)
                    }
                  >
                    Thu hồi
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ApiKeysPage;