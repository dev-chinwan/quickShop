'use client';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function ProductDeleteModal({ open, product, loading, onClose, onConfirm }) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Product" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          This action will permanently remove
          {' '}
          <span className="font-semibold text-gray-900 dark:text-white">{product?.name || 'this product'}</span>
          .
        </p>
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="danger" loading={loading} onClick={() => onConfirm?.(product?.id)}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
