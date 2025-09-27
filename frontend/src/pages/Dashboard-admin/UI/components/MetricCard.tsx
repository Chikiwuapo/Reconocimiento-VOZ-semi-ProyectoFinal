import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, CheckCircle, AlertTriangle, Info } from 'lucide-react'

export type MetricCardStatus = 'success' | 'warning' | 'error' | 'info' | undefined

export interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: number
  trendLabel?: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo' | 'yellow' | 'emerald' | 'cyan' | 'pink' | 'teal'
  isDarkMode: boolean
  size?: 'sm' | 'md' | 'lg'
  description?: string
  actionLabel?: string
  onAction?: () => void
  status?: MetricCardStatus
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendLabel, 
  color = 'blue', 
  isDarkMode, 
  size = 'md',
  description,
  actionLabel,
  onAction,
  status
}) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const valueClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  }

  const getColorClasses = (c: string) => {
    switch (c) {
      case 'blue':
        return { bg: 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' }
      case 'green':
        return { bg: 'bg-gradient-to-br from-emerald-500/20 to-green-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' }
      case 'purple':
        return { bg: 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20', text: 'text-purple-400', border: 'border-purple-500/30' }
      case 'orange':
        return { bg: 'bg-gradient-to-br from-orange-500/20 to-red-500/20', text: 'text-orange-400', border: 'border-orange-500/30' }
      case 'red':
        return { bg: 'bg-gradient-to-br from-red-500/20 to-pink-500/20', text: 'text-red-400', border: 'border-red-500/30' }
      case 'indigo':
        return { bg: 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' }
      case 'yellow':
        return { bg: 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' }
      case 'emerald':
        return { bg: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' }
      case 'cyan':
        return { bg: 'bg-gradient-to-br from-cyan-500/20 to-teal-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' }
      case 'pink':
        return { bg: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20', text: 'text-pink-400', border: 'border-pink-500/30' }
      case 'teal':
      return {
        bg: isDarkMode ? 'bg-teal-900/20' : 'bg-teal-50',
        border: isDarkMode ? 'border-teal-800/30' : 'border-teal-200',
        icon: isDarkMode ? 'text-teal-400' : 'text-teal-600',
        value: isDarkMode ? 'text-teal-300' : 'text-teal-700',
        trend: isDarkMode ? 'text-teal-400' : 'text-teal-600'
      }
    default:
        return { bg: 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' }
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />
      default:
        return null
    }
  }

  const colorClasses = getColorClasses(color)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className={`${sizeClasses[size]} rounded-2xl border transition-all duration-300 bg-surface hover:bg-surface-elevated shadow-corporate-md hover:shadow-corporate-lg border-neutral-700 hover:border-neutral-600 cursor-pointer group relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClasses.bg} group-hover:scale-110 transition-transform duration-300`}>
            <div className={colorClasses.text}>
              {icon}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {status && getStatusIcon()}
            {trend !== undefined && (
              <div className={`flex items-center text-sm font-medium px-3 py-1 rounded-full ${
                trend > 0 
                  ? 'text-success bg-success/20 border border-success/30' 
                  : trend < 0 
                  ? 'text-error bg-error/20 border border-error/30' 
                  : 'text-secondary bg-neutral-800/50 border border-neutral-700'
              }`}>
                {trend > 0 ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : trend < 0 ? (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                ) : null}
                {Math.abs(trend).toFixed(1)}%
              </div>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-secondary group-hover:text-emerald-400 transition-colors duration-300">
            {title}
          </h3>
          <div className={`${valueClasses[size]} font-bold text-primary group-hover:text-emerald-400 transition-colors duration-300`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {subtitle && (
            <p className="text-xs text-secondary leading-relaxed">
              {subtitle}
            </p>
          )}
          {description && (
            <p className="text-sm text-secondary leading-relaxed">
              {description}
            </p>
          )}
          {trendLabel && (
            <p className="text-xs text-secondary flex items-center">
              <span className="mr-1">📈</span>
              {trendLabel}
            </p>
          )}
        </div>
        {actionLabel && onAction && (
          <div className="mt-6 pt-4 border-t border-neutral-700/50">
            <button
              onClick={onAction}
              className="text-sm font-medium text-emerald-400 hover:text-cyan-400 transition-colors flex items-center group/btn"
            >
              <span>{actionLabel}</span>
              <ArrowUpRight className="w-3 h-3 ml-1 transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default MetricCard
