import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => {
  return {
    default: ({ children, href, ...props }: any) => (
      <a href={href} {...props}>
        {children}
      </a>
    ),
  }
})

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      single: vi.fn().mockResolvedValue({ data: null }),
    })),
  },
}))

vi.mock('@/lib/notify', () => ({
  createNotification: vi.fn(),
  getAuthorIdForArticle: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({ user: null }),
}))

import SudfehIcon from '@/components/SudfehIcon'
import ScrollReveal from '@/components/ScrollReveal'
import WorkCard from '@/components/WorkCard'
import LikeButton from '@/components/LikeButton'
import { Article } from '@/lib/types'

describe('SudfehIcon', () => {
  it('renders without crashing', () => {
    const { container } = render(<SudfehIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders with custom size', () => {
    const { container } = render(<SudfehIcon size={80} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '80')
    expect(svg).toHaveAttribute('height', '80')
  })

  it('applies className', () => {
    const { container } = render(<SudfehIcon className="test-class" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('test-class')
  })
})

describe('ScrollReveal', () => {
  it('renders children', () => {
    render(
      <ScrollReveal>
        <p>Reveal content</p>
      </ScrollReveal>
    )
    expect(screen.getByText('Reveal content')).toBeInTheDocument()
  })

  it('renders with className', () => {
    const { container } = render(
      <ScrollReveal className="extra-class">
        <span>Child</span>
      </ScrollReveal>
    )
    expect(container.firstChild).toHaveClass('section-reveal')
    expect(container.firstChild).toHaveClass('extra-class')
  })
})

describe('WorkCard', () => {
  const mockArticle: Article = {
    id: '1',
    title: 'Test Article Title',
    content: 'Some content',
    excerpt: 'An excerpt',
    section: 'شعر',
    date: '2025-01-15',
    author: 'Ahmad',
    readTime: '5 دقائق',
    status: 'published',
  }

  it('renders article title and author in normal mode', () => {
    render(<WorkCard article={mockArticle} />)
    expect(screen.getByText('Test Article Title')).toBeInTheDocument()
    expect(screen.getByText('Ahmad')).toBeInTheDocument()
  })

  it('renders article title and author in featured mode', () => {
    render(<WorkCard article={mockArticle} featured />)
    expect(screen.getByText('Test Article Title')).toBeInTheDocument()
    expect(screen.getByText('Ahmad')).toBeInTheDocument()
  })

  it('renders section badge', () => {
    render(<WorkCard article={mockArticle} />)
    expect(screen.getByText('شعر')).toBeInTheDocument()
  })
})

describe('LikeButton', () => {
  it('renders without crashing', () => {
    render(<LikeButton articleId="test-article-id" />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('has login prompt title when no user', () => {
    render(<LikeButton articleId="test-article-id" />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', 'سجّل الدخول للإعجاب')
  })

  it('is disabled-style when no user', () => {
    render(<LikeButton articleId="test-article-id" />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('cursor-not-allowed')
  })
})
