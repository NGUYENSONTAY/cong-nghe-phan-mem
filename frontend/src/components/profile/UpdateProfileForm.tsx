import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI, UserUpdateData } from '../../api/userAPI';
import toast from 'react-hot-toast';

const schema = yup.object({
  name: yup.string().required('Họ và tên là bắt buộc'),
  phone: yup.string().test(
    'is-valid-phone',
    'Số điện thoại không hợp lệ',
    (value) => !value || /^(0[3|5|7|8|9])+([0-9]{8})\b/.test(value)
  ).optional().default(''),
  address: yup.string().optional().default(''),
}).required();


const UpdateProfileForm: React.FC = () => {
  const { user, updateUser } = useAuth();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserUpdateData>({
    resolver: yupResolver(schema),
  });
  
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user, reset]);

  const onSubmit: SubmitHandler<UserUpdateData> = async (data) => {
    try {
      const updatedUser = await userAPI.updateProfile(data);
      updateUser(updatedUser);
      toast.success('Cập nhật thông tin thành công!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Thông tin cá nhân</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-control">
          <label className="label"><span className="label-text">Họ và tên</span></label>
          <input type="text" {...register('name')} className={`input input-bordered ${errors.name ? 'input-error' : ''}`} />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
        
        <div className="form-control">
          <label className="label"><span className="label-text">Số điện thoại</span></label>
          <input type="tel" {...register('phone')} className={`input input-bordered ${errors.phone ? 'input-error' : ''}`} />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
        </div>
        
        <div className="form-control">
          <label className="label"><span className="label-text">Địa chỉ</span></label>
          <textarea {...register('address')} className={`textarea textarea-bordered ${errors.address ? 'textarea-error' : ''}`} />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
        </div>

        <div className="form-control pt-4">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfileForm; 