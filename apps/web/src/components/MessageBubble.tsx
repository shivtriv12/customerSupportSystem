import { clsx } from 'clsx'
import ReactMarkdown from 'react-markdown'
import { Bot, User, Package, CreditCard, LifeBuoy } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Message } from '../hooks/useAgentChat'

const agentStyles = {
  SUPPORT: { bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-200', icon: LifeBuoy, color: 'text-blue-600' },
  ORDER: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', border: 'border-emerald-200', icon: Package, color: 'text-emerald-600' },
  BILLING: { bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-200', icon: CreditCard, color: 'text-purple-600' },
  DEFAULT: { bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-200', icon: Bot, color: 'text-gray-600' }
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  const style = !isUser && message.agentType 
    ? agentStyles[message.agentType] 
    : agentStyles.DEFAULT
  
  const Icon = isUser ? User : style.icon

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        "flex w-full mb-6 gap-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={clsx(
        "shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
        isUser ? "bg-black text-white" : `${style.bg} ${style.color}`
      )}>
        <Icon size={16} />
      </div>
      <div className={clsx(
        "relative max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm border",
        isUser 
          ? "bg-black text-white border-transparent rounded-tr-none" 
          : "bg-white text-gray-800 border-gray-100 rounded-tl-none"
      )}>
        {!isUser && message.agentType && (
          <span className={clsx("text-xs font-bold mb-1 block opacity-70", style.color)}>
            {message.agentType} AGENT
          </span>
        )}
        
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        
        <span className="text-[10px] opacity-40 mt-2 block text-right">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  )
}