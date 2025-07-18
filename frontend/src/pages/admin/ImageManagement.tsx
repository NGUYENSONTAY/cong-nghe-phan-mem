import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { uploadAPI } from '../../api/uploadAPI';
import toast from 'react-hot-toast';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';

interface ImageData {
  filename: string;
  url: string;
  size: number;
  lastModified: string;
}

const ImageManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<ImageData | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { 
    data: images = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery<ImageData[]>(
    'uploadedImages',
    () => uploadAPI.getImages(0, 100),
    {
      retry: 2,
      onError: (err: any) => {
        console.error('Error loading images:', err);
        toast.error('Lỗi khi tải danh sách ảnh');
      }
    }
  );

  const deleteMutation = useMutation(uploadAPI.deleteImage, {
    onSuccess: () => {
      toast.success('Đã xóa ảnh thành công');
      queryClient.invalidateQueries('uploadedImages');
      setShowDeleteModal(false);
      setImageToDelete(null);
    },
    onError: (err: any) => {
      toast.error(`Lỗi khi xóa ảnh: ${err.message}`);
    }
  });

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        toast.loading(`Đang tải ảnh ${i + 1}/${files.length}...`, { id: `upload-${i}` });
        await uploadAPI.uploadImage(file);
        successCount++;
        toast.success(`Tải ảnh ${file.name} thành công`, { id: `upload-${i}` });
      } catch (err: any) {
        errorCount++;
        toast.error(`Lỗi tải ảnh ${file.name}: ${err.message}`, { id: `upload-${i}` });
      }
    }

    setIsUploading(false);
    
    if (successCount > 0) {
      queryClient.invalidateQueries('uploadedImages');
      toast.success(`Đã tải lên ${successCount} ảnh thành công!`);
    }
    
    if (errorCount > 0) {
      toast.error(`${errorCount} ảnh tải lên thất bại`);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const toggleImageSelection = (filename: string) => {
    setSelectedImages(prev => 
      prev.includes(filename)
        ? prev.filter(f => f !== filename)
        : [...prev, filename]
    );
  };

  const selectAllImages = () => {
    setSelectedImages(images.map(img => img.filename));
  };

  const clearSelection = () => {
    setSelectedImages([]);
  };

  const bulkDelete = async () => {
    if (selectedImages.length === 0) return;

    try {
      await Promise.all(selectedImages.map(filename => uploadAPI.deleteImage(filename)));
      toast.success(`Đã xóa ${selectedImages.length} ảnh`);
      queryClient.invalidateQueries('uploadedImages');
      clearSelection();
    } catch (err: any) {
      toast.error('Lỗi khi xóa ảnh hàng loạt');
    }
  };

  const openDeleteModal = (filename: string) => {
    setImageToDelete(filename);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setImageToDelete(null);
  };

  const openPreview = (image: ImageData) => {
    setPreviewImage(image);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Đã sao chép URL ảnh');
  };

  if (isLoading) return <Loading />;
  if (isError) return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="text-center">
        <p className="text-red-500">Lỗi khi tải danh sách ảnh: {(error as Error)?.message}</p>
        <button 
          onClick={() => queryClient.invalidateQueries('uploadedImages')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý ảnh</h1>
          <p className="text-gray-600">Tải lên và quản lý ảnh cho sách</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">Kéo thả ảnh vào đây</p>
                <p className="text-gray-500">hoặc</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {isUploading ? 'Đang tải lên...' : 'Chọn ảnh'}
              </button>
              <p className="text-sm text-gray-500">
                Hỗ trợ: JPG, PNG, GIF, WebP (tối đa 5MB mỗi file)
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        {images.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {images.length} ảnh | {selectedImages.length} đã chọn
                </span>
                <button
                  onClick={selectAllImages}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Chọn tất cả
                </button>
                {selectedImages.length > 0 && (
                  <button
                    onClick={clearSelection}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Bỏ chọn
                  </button>
                )}
              </div>
              {selectedImages.length > 0 && (
                <button
                  onClick={bulkDelete}
                  className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Xóa ({selectedImages.length})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Images Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {images.map((image) => (
              <div
                key={image.filename}
                className={`relative group bg-white rounded-lg shadow-sm overflow-hidden border-2 transition-all ${
                  selectedImages.includes(image.filename) 
                    ? 'border-blue-500 shadow-md' 
                    : 'border-transparent hover:shadow-md'
                }`}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedImages.includes(image.filename)}
                    onChange={() => toggleImageSelection(image.filename)}
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                {/* Image */}
                <div 
                  className="aspect-square cursor-pointer"
                  onClick={() => openPreview(image)}
                >
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => openPreview(image)}
                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                    title="Xem ảnh"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => copyImageUrl(image.url)}
                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                    title="Sao chép URL"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openDeleteModal(image.filename)}
                    className="p-2 bg-red-500 bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                    title="Xóa ảnh"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* File Info */}
                <div className="p-3">
                  <p className="text-xs text-gray-600 truncate" title={image.filename}>
                    {image.filename}
                  </p>
                  <p className="text-xs text-gray-400">
                    {uploadAPI.formatFileSize(image.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có ảnh nào</h3>
            <p className="text-gray-500">Tải ảnh đầu tiên lên để bắt đầu quản lý</p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal isOpen={showDeleteModal} onClose={closeDeleteModal} size="sm">
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5l-6.928-7.5c-.692-.75-1.732-.75-2.464 0L4.34 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Xác nhận xóa ảnh
            </h3>
            <p className="text-gray-500 text-center mb-6">
              Bạn có chắc chắn muốn xóa ảnh "{imageToDelete}"? Hành động này không thể hoàn tác.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={() => imageToDelete && deleteMutation.mutate(imageToDelete)}
                disabled={deleteMutation.isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-300"
              >
                {deleteMutation.isLoading ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Image Preview Modal */}
        {previewImage && (
          <Modal isOpen={true} onClose={closePreview} size="lg">
            <div className="p-6">
              <div className="mb-4">
                <img
                  src={previewImage.url}
                  alt={previewImage.filename}
                  className="w-full h-auto max-h-96 object-contain mx-auto rounded"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Tên file:</span>
                  <span className="text-gray-600 text-sm">{previewImage.filename}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Kích thước:</span>
                  <span className="text-gray-600 text-sm">{uploadAPI.formatFileSize(previewImage.size)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">URL:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 text-sm truncate max-w-xs">{previewImage.url}</span>
                    <button
                      onClick={() => copyImageUrl(previewImage.url)}
                      className="p-1 text-blue-600 hover:text-blue-700"
                      title="Sao chép URL"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Ngày tải:</span>
                  <span className="text-gray-600 text-sm">
                    {new Date(previewImage.lastModified).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => copyImageUrl(previewImage.url)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Sao chép URL
                </button>
                <button
                  onClick={closePreview}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default ImageManagement; 