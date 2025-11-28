/**
 * Global Loading State - Usage Examples
 * 
 * This file demonstrates how to use the global loading state
 * from anywhere in your application.
 */

import { useLoadingStore } from '@/store/loading-store'

// Example 1: Basic usage in a component
function MyComponent() {
    const setLoading = useLoadingStore((state) => state.setLoading)

    const handleClick = async () => {
        // Show loading
        setLoading(true, 'Fetching course data...')

        try {
            await fetch('/api/courses')
            // Your logic here
        } finally {
            // Hide loading
            setLoading(false)
        }
    }

    return <button onClick={ handleClick }> Load Data </button>
}

// Example 2: With custom messages
async function navigateToCourse() {
    const { setLoading } = useLoadingStore.getState()

    setLoading(true, 'Loading course content...')
    // Navigate or fetch data
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
}

// Example 3: In server actions or API routes
export async function someServerAction() {
    // You can also trigger from server by returning a flag
    // and handling it in the client component
    return { showLoading: true, message: 'Processing...' }
}

/**
 * HOW TO USE:
 * 
 * 1. Import the store:
 *    import { useLoadingStore } from '@/store/loading-store'
 * 
 * 2. Get the setLoading function:
 *    const setLoading = useLoadingStore((state) => state.setLoading)
 * 
 * 3. Show loading:
 *    setLoading(true, 'Your custom message')
 * 
 * 4. Hide loading:
 *    setLoading(false)
 * 
 * The loading overlay will automatically appear/disappear globally!
 */
