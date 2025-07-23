import { motion } from 'framer-motion'

export default function AnimatedButton({ text, href, primary, white }) {
  const buttonClass = primary 
    ? 'bg-green-600 hover:bg-green-700 text-white'
    : white
    ? 'bg-white hover:bg-green-50 text-green-700'
    : 'bg-transparent hover:bg-green-100 text-green-700 border border-green-600'
  
  return (
    <motion.a
      href={href}
      className={`px-6 py-3 rounded-lg font-medium transition-colors ${buttonClass}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {text}
    </motion.a>
  )
}