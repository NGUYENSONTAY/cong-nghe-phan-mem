import React, { useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { orderAPI, CheckoutData } from '../api/orderAPI';
import toast from 'react-hot-toast';

const schema = yup.object({
  customerName: yup.string().required('Họ và tên là bắt buộc'),
  phone: yup.string().required('Số điện thoại là bắt buộc').matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ'),
  address: yup.string().required('Địa chỉ là bắt buộc'),
  email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
  paymentMethod: yup.string().oneOf(['COD', 'ONLINE'] as const).required('Vui lòng chọn phương thức thanh toán'),
});

type CheckoutFormInput = yup.InferType<typeof schema> & { note?: string };

const CheckoutPage: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<CheckoutFormInput>({
    resolver: yupResolver(schema),
    defaultValues: {
      customerName: '',
      phone: '',
      address: '',
      email: '',
      paymentMethod: 'COD',
    }
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      setValue('customerName', user.name);
      setValue('email', user.email);
      if (user.phone) setValue('phone', user.phone);
      if (user.address) setValue('address', user.address);
    }
  }, [isAuthenticated, user, setValue]);
  
  useEffect(() => {
    if (cart.items.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống, không thể thanh toán.");
      navigate('/books');
    }
  }, [cart.items, navigate]);

  const onSubmit: SubmitHandler<CheckoutFormInput> = async (data) => {
    const orderData: CheckoutData = {
      customerName: data.customerName,
      phone: data.phone,
      address: data.address,
      email: data.email,
      paymentMethod: data.paymentMethod,
      note: data.note,
      items: cart.items.map(item => ({
        bookId: item._id,
        quantity: item.quantity,
      })),
    };

    try {
      await orderAPI.createOrder(orderData);
      toast.success('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
      clearCart();
      navigate('/orders');
    } catch (error: any) {
      toast.error(error.message || 'Đã có lỗi xảy ra khi đặt hàng.');
    }
  };
  
  return (
    <div className="bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Thanh toán</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Họ và tên</label>
                <input type="text" id="customerName" {...register('customerName')} className={`mt-1 input input-bordered w-full ${errors.customerName ? 'input-error' : ''}`} />
                {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" id="email" {...register('email')} className={`mt-1 input input-bordered w-full ${errors.email ? 'input-error' : ''}`} />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                  <input type="tel" id="phone" {...register('phone')} className={`mt-1 input input-bordered w-full ${errors.phone ? 'input-error' : ''}`} />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                <input type="text" id="address" {...register('address')} className={`mt-1 input input-bordered w-full ${errors.address ? 'input-error' : ''}`} />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
              </div>
               <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700">Ghi chú (tùy chọn)</label>
                <textarea id="note" {...register('note')} className="mt-1 textarea textarea-bordered w-full" rows={3}></textarea>
              </div>
            </div>

            <h2 className="text-xl font-semibold mt-8 mb-4">Phương thức thanh toán</h2>
            <div className="space-y-2">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-400">
                <input type="radio" value="COD" {...register('paymentMethod')} className="radio radio-primary" />
                <span className="ml-4 font-medium">Thanh toán khi nhận hàng (COD)</span>
              </label>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-400">
                <input type="radio" value="ONLINE" {...register('paymentMethod')} className="radio radio-primary" disabled/>
                <span className="ml-4 font-medium text-gray-400">Chuyển khoản / Ví điện tử (Đang phát triển)</span>
              </label>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Đơn hàng của bạn</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {cart.items.map(item => (
                  <div key={item._id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                        <img src={item.image || 'https://via.placeholder.com/60x80?text=No+Image'} alt={item.title} className="w-12 h-16 object-cover rounded mr-3"/>
                        <div>
                            <p className="font-semibold leading-tight">{item.title}</p>
                            <p className="text-gray-500">x {item.quantity}</p>
                        </div>
                    </div>
                    <span className="font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</span>
                  </div>
                ))}
              </div>
              <hr className="my-4"/>
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng tiền</span>
                <span>{cart.totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
              <button type="submit" className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting}>
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage; 