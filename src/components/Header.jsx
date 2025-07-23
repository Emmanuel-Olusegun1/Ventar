import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient' // Configure this separately

export default function Header() {
  return (
    <header className="py-6 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-green-700">Ventar</h1>
        </motion.div>
        
        <motion.nav
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-6"
        >
          <a href="/features" className="text-green-700 hover:text-green-600 font-medium">Features</a>
          <a href="/pricing" className="text-green-700 hover:text-green-600 font-medium">Pricing</a>
          <button 
            onClick={() => supabase.auth.signIn()}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </motion.nav>
      </div>
    </header>
  )
}