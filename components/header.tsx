'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { NEXT_PUBLIC_SITE_TITLE } from '../app/server-constants'
import styles from '../styles/header.module.css'

interface NavItem {
  label: string
  path: string
}

const Header = () => {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Map', path: '/map' },
    { label: 'Blog', path: '/blog' },
    { label: 'Space', path: '/space' },
  ]

  return (
    <header className={styles.header}>
      <h1>
        <Link href="/">
          <Image
            src="/herohoro_title.png"
            width={400}
            height={100}
            style={{ objectFit: 'contain' }}
            alt={NEXT_PUBLIC_SITE_TITLE}
          />
        </Link>
      </h1>

      <ul className={styles.naviContent}>
        {navItems.map(({ label, path }) => (
          <li key={label}>
            <Link href={path} className={pathname === path ? 'active' : null}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </header>
  )
}

export default Header
