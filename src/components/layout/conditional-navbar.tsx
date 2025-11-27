'use client'

import { Navbar } from './navbar'

export function ConditionalNavbar() {
    // Always show navbar now - it's dynamic based on auth state
    return <Navbar />
}
