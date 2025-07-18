import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterRequest } from '../../types';

type RegisterFormInputs = RegisterRequest & {
  confirmPassword: string;
};

const schema = yup.object().shape({
  name: yup.string().required('Họ và tên là bắt buộc'),
  email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
  password: yup.string().required('Mật khẩu là bắt buộc').min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), undefined], 'Mật khẩu không khớp')
    .required('Vui lòng xác nhận mật khẩu'),
});

const RegisterPage: React.FC = () => {
  const { register: registerUser, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormInputs>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      navigate('/login');
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col w-full max-w-md">
        <div className="text-center">
          <h1 className="text-5xl font-bold">Tạo tài khoản mới</h1>
          <p className="py-6">
            Tham gia cộng đồng yêu sách của chúng tôi ngay hôm nay!
          </p>
        </div>
        <div className="card shrink-0 w-full shadow-2xl bg-base-100">
          <form onSubmit={handleSubmit(onSubmit)} className="card-body">
            <div className="form-control">
              <label className="label"><span className="label-text">Họ và tên</span></label>
              <input type="text" placeholder="Nguyễn Văn A" className={`input input-bordered ${errors.name ? 'input-error' : ''}`} {...register('name')} />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Email</span></label>
              <input type="email" placeholder="email@example.com" className={`input input-bordered ${errors.email ? 'input-error' : ''}`} {...register('email')} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Mật khẩu</span></label>
              <input type="password" placeholder="mật khẩu" className={`input input-bordered ${errors.password ? 'input-error' : ''}`} {...register('password')} />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Xác nhận mật khẩu</span></label>
              <input type="password" placeholder="xác nhận mật khẩu" className={`input input-bordered ${errors.confirmPassword ? 'input-error' : ''}`} {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || isLoading}>
                {isSubmitting || isLoading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
            </div>
            <div className="text-center mt-4">
              <p className="text-sm">
                Đã có tài khoản?{' '}
                <Link to="/login" className="link link-primary">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 