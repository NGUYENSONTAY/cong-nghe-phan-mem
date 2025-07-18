import React, { useState, useEffect } from 'react';
import { uploadAPI } from '../../api/uploadAPI';
import toast from 'react-hot-toast';
import Loading from '../common/Loading';
import Modal from '../common/Modal';

interface ImageData {
  filename: string;
  url: string;
  size: number;
  lastModified: string;
}

interface ImageGalleryProps {
  onImageSelect?: (imageUrl: string) => void;
  showSelectButton?: boolean;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  onImageSelect,
  showSelectButton = false,
  className = ''
}) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async (currentPage = 0) => {
    try {
      setLoading(true);
      const response = await uploadAPI.getImages(currentPage, 20);
      
      if (currentPage === 0) {
        setImages(response);
      } else {
        setImages(prev => [...prev, ...response]);
      }
      
      setHasMore(response.length === 20);
      setPage(currentPage);
    } catch (error: any) {
      toast.error('Lỗi khi tải danh sách ảnh');
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadImages(page + 1);
    }
  };

  const handleDeleteImage = async () => {
    if (!imageToDelete) return;

    try {
      await uploadAPI.deleteImage(imageToDelete);
      setImages(prev => prev.filter(img => img.filename !== imageToDelete));
      toast.success('Đã xóa ảnh thành công');
      setShowDeleteModal(false);
      setImageToDelete(null);
    } catch (error: any) {
      toast.error('Lỗi khi xóa ảnh');
      console.error('Error deleting image:', error);
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

  const handleImageClick = (image: ImageData) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const handleSelectImage = (imageUrl: string) => {
    if (onImageSelect) {
      onImageSelect(imageUrl);
      toast.success('Đã chọn ảnh');
    }
  };

  const copyImageUrl = (imageUrl: string) => {
    navigator.clipboard.writeText(imageUrl);
    toast.success('Đã copy URL ảnh');
  };

  if (loading && images.length === 0) {
    return <Loading />;
  }

  return (
    <div className={className}>
      {images.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="h-12 w-12 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có ảnh nào
          </h3>
          <p className="text-gray-500">
            Tải lên ảnh đầu tiên để bắt đầu
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {images.map((image) => (
              <div
                key={image.filename}
                className="relative group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div
                  className="aspect-square cursor-pointer"
                  onClick={() => handleImageClick(image)}
                >
                  <img
                    src={uploadAPI.getImageUrl(image.filename)}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    {showSelectButton && (
                      <button
                        onClick={() => handleSelectImage(uploadAPI.getImageUrl(image.filename))}
                        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                        title="Chọn ảnh này"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    
                    <button
                      onClick={() => copyImageUrl(uploadAPI.getImageUrl(image.filename))}
                      className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                      title="Copy URL"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => openDeleteModal(image.filename)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Xóa ảnh"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* File info */}
                <div className="p-2">
                  <p className="text-xs text-gray-500 truncate" title={image.filename}>
                    {image.filename}
                  </p>
                  <p className="text-xs text-gray-400">
                    {uploadAPI.formatFileSize(image.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Load more button */}
          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={loadMore}
                disabled={loading}
                className="btn btn-outline"
              >
                {loading ? 'Đang tải...' : 'Tải thêm'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Image preview modal */}
      {selectedImage && (
        <Modal isOpen={true} onClose={closeImageModal} size="lg">
          <div className="p-4">
            <div className="mb-4">
              <img
                src={uploadAPI.getImageUrl(selectedImage.filename)}
                alt={selectedImage.filename}
                className="w-full h-auto max-h-96 object-contain mx-auto"
              />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Tên file:</span>
                <span className="text-gray-600">{selectedImage.filename}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Kích thước:</span>
                <span className="text-gray-600">{uploadAPI.formatFileSize(selectedImage.size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Ngày tải:</span>
                <span className="text-gray-600">
                  {new Date(selectedImage.lastModified).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              {showSelectButton && (
                <button
                  onClick={() => {
                    handleSelectImage(uploadAPI.getImageUrl(selectedImage.filename));
                    closeImageModal();
                  }}
                  className="btn btn-primary"
                >
                  Chọn ảnh này
                </button>
              )}
              <button
                onClick={() => copyImageUrl(uploadAPI.getImageUrl(selectedImage.filename))}
                className="btn btn-outline"
              >
                Copy URL
              </button>
              <button onClick={closeImageModal} className="btn btn-outline">
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <Modal isOpen={true} onClose={closeDeleteModal}>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Xác nhận xóa ảnh
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa ảnh này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={closeDeleteModal} className="btn btn-outline">
                Hủy
              </button>
              <button onClick={handleDeleteImage} className="btn btn-danger">
                Xóa
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ImageGallery; 