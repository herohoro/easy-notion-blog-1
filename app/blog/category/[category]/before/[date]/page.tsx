import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  NEXT_PUBLIC_URL,
  NEXT_PUBLIC_SITE_TITLE,
  NEXT_PUBLIC_SITE_DESCRIPTION,
  NUMBER_OF_POSTS_PER_PAGE,
} from '../../../../../../app/server-constants'
import {
  BlogPostLink,
  BlogTagLink,
  BlogCategoryLink,
  NoContents,
  PostDate,
  PostExcerpt,
  PostTags,
  PostCategory,
  PostTitle,
  PostThumbnail,
  PostLike,
  BuyMeCoffee,
  NotionLink,
} from '../../../../../../components/blog-parts'
import { TwitterTimeline } from '../../../../../../components/twitter-timeLine'
import { NextBackPageLink } from '../../../../../../components/nextbackpage'
import { BackPageLink } from '../../../../../../components/backpage'
import {
  getPosts,
  getRankedPosts,
  getPostsByCategoryBefore,
  getFirstPostByCategory,
  getAllTags,
  getAllCategorys,
} from '../../../../../../lib/notion/client'
import styles from '../../../../../../styles/blog.module.css'

export const revalidate = 3600
export const dynamic = 'force-dynamic'

export async function generateMetadata(props): Promise<Metadata> {
  const params = await props.params;

  const {
    date: encodedDate,
    category: encodedCategory
  } = params;

  const date = decodeURIComponent(encodedDate)
  const tag = decodeURIComponent(encodedCategory)
  const title = `Posts in ${tag} before ${
    date.split('T')[0]
  } - ${NEXT_PUBLIC_SITE_TITLE}`
  const description = NEXT_PUBLIC_SITE_DESCRIPTION
  const url = NEXT_PUBLIC_URL ? new URL('/blog', NEXT_PUBLIC_URL) : undefined
  const images = NEXT_PUBLIC_URL
    ? [{ url: new URL('/hero-room.jpg', NEXT_PUBLIC_URL) }]
    : []

  const metadata: Metadata = {
    title: title,
    openGraph: {
      title: title,
      description: description,
      url: url,
      siteName: title,
      type: 'website',
      images: images,
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: images,
    },
    alternates: {
      canonical: url,
    },
  }

  return metadata
}

const BlogCategoryBeforeDatePage = async props => {
  const params = await props.params;

  const {
    category: encodedCategory,
    date: encodedDate
  } = params;

  const category = decodeURIComponent(encodedCategory)
  const date = decodeURIComponent(encodedDate)

  if (!Date.parse(date) || !/^\d{4}-\d{2}-\d{2}/.test(date)) {
    notFound()
  }

  const [posts, firstPost, rankedPosts, recentPosts, tags, categorys] =
    await Promise.all([
      getPostsByCategoryBefore(category, date, NUMBER_OF_POSTS_PER_PAGE),
      getFirstPostByCategory(category),
      getRankedPosts(),
      getPosts(5),
      getAllTags(),
      getAllCategorys(),
    ])

  return (
    <>
      <div className={styles.container}>
        <div className={styles.flexWraper}>
          <div className={styles.mainContent}>
            <header className={styles.mainTop}>
              <h2>{category}</h2>
            </header>
            <div className={styles.mainGallery}>
              <NoContents contents={posts} />

              {posts.map((post) => {
                return (
                  <div className={styles.post} key={post.Slug}>
                    <div className={styles.twoColums}>
                      <PostDate post={post} />
                      <PostLike post={post} />
                    </div>
                    <PostCategory post={post} />
                    <PostTitle post={post} />
                    <PostThumbnail post={post} />
                    <PostTags post={post} />
                    <PostExcerpt post={post} />
                  </div>
                )
              })}
            </div>

            <footer>
              <NextBackPageLink
                firstPost={firstPost}
                posts={posts}
                category={category}
              />
              <BackPageLink firstPost={firstPost} posts={posts} />
            </footer>
          </div>

          <div className={styles.subContent}>
            <BuyMeCoffee />
            <NotionLink />
            <BlogCategoryLink heading="Category List" categorys={categorys} />
            <BlogTagLink heading="Tag List" tags={tags} />
            <BlogPostLink heading="Recommended" posts={rankedPosts} />
            <BlogPostLink heading="Latest Posts" posts={recentPosts} />
            <TwitterTimeline />
          </div>
        </div>
        <div className={styles.endContent}>
          <div className={styles.endSection}>
            <BlogPostLink heading="Recommended" posts={rankedPosts} />
          </div>
          <div className={styles.endSection}>
            <BlogPostLink heading="Latest Posts" posts={recentPosts} />
          </div>
          <div className={styles.endSection}>
            <BlogCategoryLink heading="Tag List" categorys={categorys} />
            <TwitterTimeline />
          </div>
        </div>
      </div>
    </>
  )
}

export default BlogCategoryBeforeDatePage
