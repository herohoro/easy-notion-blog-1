import { useRouter } from 'next/router'

import { NUMBER_OF_POSTS_PER_PAGE } from '../../../lib/notion/server-constants'
import DocumentHead from '../../../components/document-head'
import {
  BlogPostLink,
  NextPageLink,
  BlogTagLink,
  NoContents,
  PostDate,
  PostExcerpt,
  PostTags,
  PostTitle,
  PostsNotFound,
  PostThumbnail,
  TwitterTimeline,
  RssFeed
} from '../../../components/blog-parts'
import styles from '../../../styles/blog.module.css'
import { getTagLink } from '../../../lib/blog-helpers'
import { useEffect } from 'react'
import {
  getPosts,
  getRankedPosts,
  getPostsByTag,
  getFirstPostByTag,
  getAllTags,
} from '../../../lib/notion/client'
import * as imageCache from '../../../lib/notion/image-cache'

export async function getStaticProps({ params: { tag } }) {
  const posts = await getPostsByTag(tag, NUMBER_OF_POSTS_PER_PAGE)

  const [firstPost, rankedPosts, recentPosts, tags] = await Promise.all([
    getFirstPostByTag(tag),
    getRankedPosts(),
    getPosts(5),
    getAllTags(),
  ])

  if (posts.length === 0) {
    console.log(`Failed to find posts for tag: ${tag}`)
    return {
      props: {
        redirect: '/blog',
      },
      revalidate: 30,
    }
  }

  posts.forEach(p => p.OGImage && imageCache.store(p.PageId, p.OGImage))

  return {
    props: {
      posts,
      firstPost,
      rankedPosts,
      recentPosts,
      tags,
      tag,
    },
    revalidate: 60,
  }
}

export async function getStaticPaths() {
  const tags = await getAllTags()

  return {
    paths: tags.map(tag => getTagLink(tag)),
    fallback: 'blocking',
  }
}

const RenderPostsByTags = ({
  tag,
  posts = [],
  firstPost,
  rankedPosts = [],
  recentPosts = [],
  tags = [],
  redirect,
}) => {
  const router = useRouter()

  useEffect(() => {
    if (redirect && posts.length === 0) {
      router.replace(redirect)
    }
  }, [router, redirect, posts])

  if (!posts) {
    return <PostsNotFound />
  }

  return (
    <div className={styles.container}>
      <DocumentHead description={`Posts in ${tag}`} />
      <div className={styles.flexWraper}>
        <div className={styles.mainContent}>
          <header className={styles.mainTop}>
            <h2>{tag}</h2>
          </header>
          <div className={styles.mainGallery}>
            <NoContents contents={posts} />

            {posts.map(post => {
              return (
                <div className={styles.post} key={post.Slug}>
                  <PostDate post={post} />
                  <PostTitle post={post} />
                  <PostThumbnail post={post} />
                  <PostTags post={post} />
                  <PostExcerpt post={post} />
                </div>
              )
            })}
          </div>
          <footer>
            <NextPageLink firstPost={firstPost} posts={posts} tag={tag} />

            {/* {!!firstPost &&
              posts.length > 0 &&
              firstPost.Date !== posts[posts.length - 1].Date && (
                <div className={stylesParts.nextContainer}>
                  <hr />
                  <div className={stylesParts.buttonSubContainer}>
                    <a
                      className={stylesParts.backButton}
                      onClick={() => router.back()}
                    >
                      {' '}
                      ＜ Back{' '}
                    </a>
                    <Link
                      href="/blog/before/[date]"
                      as={getBeforeLink(posts[posts.length - 1].Date)}
                      passHref
                    >
                      <a className={stylesParts.nextButton}>Next ＞</a>
                    </Link>
                  </div>
                </div>
              )} */}
          </footer>
        </div>

        <div className={styles.subContent}>
          <RssFeed/>
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
          <BlogTagLink heading="Tag List" tags={tags} />
          <TwitterTimeline />
        </div>
      </div>
    </div>
  )
}

export default RenderPostsByTags
