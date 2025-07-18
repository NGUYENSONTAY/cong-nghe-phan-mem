import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { userAPI } from '../../api/userAPI';
import { ChangePasswordRequest } from '../../types';
import toast from 'react-hot-toast';

const schema = yup.object().shape({
    oldPassword: yup.string().required('Mật khẩu hiện tại là bắt buộc'),
    newPassword: yup.string().required('Mật khẩu mới là bắt buộc').min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmNewPassword: yup.string()
        .oneOf([yup.ref('newPassword'), undefined], 'Mật khẩu xác nhận không khớp')
        .required('Vui lòng xác nhận mật khẩu mới'),
});

// Loại bỏ confirmNewPassword khỏi type request
type ChangePasswordFormInputs = ChangePasswordRequest & {
    confirmNewPassword: string;
};

const ChangePasswordForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ChangePasswordFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<ChangePasswordFormInputs> = async (data) => {
    try {
      const payload: ChangePasswordRequest = {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      };
      await userAPI.changePassword(payload);
      toast.success('Đổi mật khẩu thành công!');
      reset(); // Xóa các trường trong form
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4">Đổi mật khẩu</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-control">
          <label className="label"><span className="label-text">Mật khẩu hiện tại</span></label>
          <input type="password" {...register('oldPassword')} className={`input input-bordered ${errors.oldPassword ? 'input-error' : ''}`} />
          {errors.oldPassword && <p className="text-red-500 text-sm mt-1">{errors.oldPassword.message}</p>}
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text">Mật khẩu mới</span></label>
          <input type="password" {...register('newPassword')} className={`input input-bordered ${errors.newPassword ? 'input-error' : ''}`} />
          {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>}
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text">Xác nhận mật khẩu mới</span></label>
          <input type="password" {...register('confirmNewPassword')} className={`input input-bordered ${errors.confirmNewPassword ? 'input-error' : ''}`} />
          {errors.confirmNewPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmNewPassword.message}</p>}
        </div>
        <div className="form-control pt-4">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Đổi mật khẩu'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordForm; 