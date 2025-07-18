import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { adminBooksAPI } from '../../api/adminBooksAPI';
import BookForm, { BookFormData } from '../../components/admin/BookForm';

const AddBook: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createBookMutation = useMutation(adminBooksAPI.createBook, {
    onSuccess: (data) => {
      console.log('✅ Mutation success:', data);
      toast.success('Thêm sách thành công!');
      queryClient.invalidateQueries('adminBooks');
      navigate('/admin/books');
    },
    onError: (error: Error) => {
      console.error('❌ Mutation error:', error);
      toast.error(`Lỗi khi thêm sách: ${error.message}`);
    },
    onMutate: (variables) => {
      console.log('🚀 Mutation starting with variables:', variables);
    }
  });

  const handleCreateBook = async (data: BookFormData) => {
    console.log('🔥 AddBook handleCreateBook called with data:', data);
    console.log('📊 Mutation state before call:', {
      isLoading: createBookMutation.isLoading,
      isError: createBookMutation.isError,
      error: createBookMutation.error
    });
    
    try {
      createBookMutation.mutate(data);
      console.log('📤 Mutation.mutate() called successfully');
    } catch (error) {
      console.error('🚨 Error calling mutation.mutate():', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Thêm sách mới</h1>
        <p className="text-gray-600">Điền thông tin để thêm sách mới vào hệ thống</p>
      </div>

      <BookForm
        onSubmit={handleCreateBook}
        isSubmitting={createBookMutation.isLoading}
        submitButtonText="Thêm sách"
      />
    </div>
  );
};

export default AddBook; 