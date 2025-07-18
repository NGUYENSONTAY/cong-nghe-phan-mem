import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { adminBooksAPI } from '../../api/adminBooksAPI';
import BookForm, { BookFormData } from '../../components/admin/BookForm';
import Loading from '../../components/common/Loading';

const EditBook = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch the book data
  const { data: book, isLoading: isLoadingBook, error } = useQuery(
    ['book', id],
    () => adminBooksAPI.getBook(id!),
    {
      enabled: !!id, // Only run the query if id is present
    }
  );

  // Setup mutation for updating the book
  const { mutateAsync, isLoading: isUpdating } = useMutation(
    (data: BookFormData) => adminBooksAPI.updateBook(id!, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminBooks');
        queryClient.invalidateQueries(['book', id]);
        toast.success('Cập nhật sách thành công!');
        navigate('/admin/books');
      },
      onError: (error: Error) => {
        toast.error(`Lỗi khi cập nhật sách: ${error.message}`);
      },
    }
  );

  const handleUpdateBook = async (data: BookFormData) => {
    await mutateAsync(data);
  };

  if (isLoadingBook) return <Loading />;
  if (error) return <p className="text-red-500">Lỗi khi tải dữ liệu sách: {(error as Error).message}</p>;
  if (!book) return <p>Không tìm thấy sách.</p>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link to="/admin/books" className="text-indigo-600 hover:text-indigo-900">
          &larr; Quay lại danh sách
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mt-2">Chỉnh Sửa Sách</h1>
      </div>
      <BookForm
        onSubmit={handleUpdateBook}
        isSubmitting={isUpdating}
        initialData={book}
        submitButtonText="Cập Nhật"
      />
    </div>
  );
};

export default EditBook; 