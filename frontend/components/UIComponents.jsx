// Shared UI Components for Admin & Pengelola
import React from 'react';

// ==================== THEME CONFIGURATION ====================
export const THEME = {
  // Shared colors
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  // Status colors
  status: {
    draft: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-300',
      icon: 'text-gray-600'
    },
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      icon: 'text-yellow-600'
    },
    published: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      icon: 'text-green-600'
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      icon: 'text-red-600'
    }
  }
};

// ==================== BUTTON COMPONENTS ====================

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  onClick, 
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = false
}) => {
  const variants = {
    primary: 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white shadow-md hover:shadow-lg',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-md hover:shadow-lg',
    info: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg',
    outline: 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2 
    font-medium rounded-lg transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </button>
  );
};

// ==================== CARD COMPONENTS ====================

export const Card = ({ children, className = '', hover = false }) => {
  return (
    <div className={`
      bg-white rounded-xl shadow-md overflow-hidden
      ${hover ? 'transition-all hover:shadow-xl hover:scale-[1.02]' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 bg-gray-50 ${className}`}>
      {children}
    </div>
  );
};

export const CardBody = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}>
      {children}
    </div>
  );
};

// ==================== STATS CARD ====================

export const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  trend = null,
  onClick = null 
}) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-orange-500',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    gray: 'from-gray-500 to-gray-600'
  };

  return (
    <div 
      onClick={onClick}
      className={`
        bg-gradient-to-br ${colors[color]} 
        rounded-xl shadow-lg p-6 text-white
        ${onClick ? 'cursor-pointer hover:shadow-xl transition-all hover:scale-105' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm mb-1 font-medium">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <p className="text-xs text-white/70 mt-2">{trend}</p>
          )}
        </div>
        <div className="w-12 h-12 opacity-50">
          {icon}
        </div>
      </div>
    </div>
  );
};

// ==================== BADGE COMPONENTS ====================

export const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  icon = null 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-300',
    primary: 'bg-green-100 text-green-800 border-green-300',
    success: 'bg-green-100 text-green-800 border-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    danger: 'bg-red-100 text-red-800 border-red-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span className={`
      inline-flex items-center gap-1
      font-semibold rounded-full border
      ${variants[variant]}
      ${sizes[size]}
    `}>
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </span>
  );
};

export const StatusBadge = ({ statusId }) => {
  const statusMap = {
    1: { text: 'Draft', variant: 'default' },
    2: { text: 'Pending Review', variant: 'warning' },
    3: { text: 'Published', variant: 'success' },
    4: { text: 'Rejected', variant: 'danger' }
  };

  const status = statusMap[statusId] || { text: 'Unknown', variant: 'default' };

  return <Badge variant={status.variant}>{status.text}</Badge>;
};

// ==================== ALERT COMPONENTS ====================

export const Alert = ({ 
  children, 
  variant = 'info', 
  icon = null,
  onClose = null,
  title = null 
}) => {
  const variants = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border-red-200 text-red-800'
  };

  const iconColors = {
    info: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600'
  };

  return (
    <div className={`
      border rounded-lg p-4 mb-4
      ${variants[variant]}
    `}>
      <div className="flex items-start">
        {icon && (
          <div className={`w-5 h-5 mr-3 mt-0.5 ${iconColors[variant]}`}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          {title && (
            <h3 className="font-semibold mb-1">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// ==================== LOADING COMPONENTS ====================

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-green-600 ${sizes[size]} ${className}`}></div>
  );
};

export const LoadingScreen = ({ message = 'Memuat data...' }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
};

// ==================== MODAL COMPONENTS ====================

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-xl w-full ${sizes[size]} max-h-[90vh] overflow-auto shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 flex justify-between items-center z-10 rounded-t-xl">
          <h2 className="text-2xl font-bold">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// ==================== FORM COMPONENTS ====================

export const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder = '',
  required = false,
  error = null,
  disabled = false,
  icon = null,
  helperText = null,
  ...props 
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500' : 'border-gray-300'}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-gray-500 text-xs mt-1">{helperText}</p>
      )}
    </div>
  );
};

export const TextArea = ({ 
  label, 
  value, 
  onChange, 
  placeholder = '',
  required = false,
  error = null,
  disabled = false,
  rows = 3,
  helperText = null,
  ...props 
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`
          w-full px-3 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-gray-500 text-xs mt-1">{helperText}</p>
      )}
    </div>
  );
};

export const Select = ({ 
  label, 
  value, 
  onChange, 
  options = [],
  placeholder = 'Pilih...',
  required = false,
  error = null,
  disabled = false,
  helperText = null,
  ...props 
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-gray-500 text-xs mt-1">{helperText}</p>
      )}
    </div>
  );
};

export const FileInput = ({ 
  label, 
  onChange, 
  accept = 'image/*',
  required = false,
  error = null,
  disabled = false,
  helperText = null,
  preview = null,
  ...props 
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="file"
        accept={accept}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        {...props}
      />
      {preview && (
        <div className="mt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="max-w-xs rounded-lg shadow-md" />
        </div>
      )}
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-gray-500 text-xs mt-1">{helperText}</p>
      )}
    </div>
  );
};

// ==================== TABLE COMPONENTS ====================

export const Table = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${className}`}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children }) => {
  return (
    <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
      {children}
    </thead>
  );
};

export const TableBody = ({ children }) => {
  return (
    <tbody className="divide-y divide-gray-200 bg-white">
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, onClick = null, className = '' }) => {
  return (
    <tr 
      onClick={onClick}
      className={`
        hover:bg-gray-50 transition-colors
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className = '' }) => {
  return (
    <th className={`
      px-6 py-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wider
      ${className}
    `}>
      {children}
    </th>
  );
};

export const TableCell = ({ children, className = '' }) => {
  return (
    <td className={`px-6 py-4 ${className}`}>
      {children}
    </td>
  );
};

// ==================== EMPTY STATE ====================

export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action = null 
}) => {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto text-gray-300 mb-4">
        {icon || (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      {action && action}
    </div>
  );
};

// ==================== PAGINATION ====================

export const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`
            px-4 py-2 rounded-lg font-medium
            ${page === currentPage 
              ? 'bg-green-600 text-white' 
              : 'border border-gray-300 hover:bg-gray-50'
            }
          `}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

// ==================== FILTER TABS ====================

export const FilterTabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-md mb-6 p-2">
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`
              flex-1 min-w-[120px] px-4 py-3 rounded-lg font-medium transition-all
              ${activeTab === tab.key
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`
                ml-2 px-2 py-0.5 rounded-full text-xs font-bold
                ${activeTab === tab.key 
                  ? 'bg-white text-green-600' 
                  : 'bg-gray-200 text-gray-700'
                }
              `}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// ==================== PAGE HEADER ====================

export const PageHeader = ({ 
  title, 
  description, 
  action = null,
  icon = null,
  breadcrumb = null 
}) => {
  return (
    <div className="mb-8">
      {breadcrumb && (
        <div className="mb-4 text-sm text-gray-600">
          {breadcrumb}
        </div>
      )}
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            {description && (
              <p className="text-gray-600 text-lg">{description}</p>
            )}
          </div>
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== CONFIRM DIALOG ====================

export const ConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Konfirmasi Hapus',
  message = 'Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.',
  confirmText = 'Hapus',
  cancelText = 'Batal',
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== EXPORTS ====================

const UIComponents = {
  // Theme
  THEME,
  
  // Buttons
  Button,
  
  // Cards
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  StatsCard,
  
  // Badges
  Badge,
  StatusBadge,
  
  // Alerts
  Alert,
  
  // Loading
  LoadingSpinner,
  LoadingScreen,
  
  // Modal
  Modal,
  
  // Forms
  Input,
  TextArea,
  Select,
  FileInput,
  
  // Table
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  
  ConfirmDialog,
  
  // Others
  EmptyState,
  Pagination,
  FilterTabs,
  PageHeader
};

export default UIComponents;
