'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useCallback, useState, useRef, useEffect } from 'react'
import useStore from '../../../../store'

const NewPost = ({ serverUser }) => {
    const [loading, setLoading] = useState(false)
    const [image, setImage] = useState<File | null>(null)
    const router = useRouter()
    const { user, setUser } = useStore()
    const titleRef = useRef<HTMLInputElement>(null)
    const contentRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (serverUser) {
            setUser(serverUser) // Zustand に user をセット
        } else {
            router.push('/login') // 未ログインならログインページへ
        }
    }, [serverUser, setUser, router])

    if (!user) return <div>Loading...</div>

    // 画像のアップロード処理
    const onUploadImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            setImage(files[0])
        }
    }, [])

    // フォーム送信処理
    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        if (!user.id || !image) {
            alert("User ID or image is missing")
            setLoading(false)
            return
        }

        const formData = new FormData()
        formData.append('title', titleRef.current?.value || '')
        formData.append('content', contentRef.current?.value || '')
        formData.append('userId', user.id)
        formData.append('image', image)

        formData.forEach((value, key) => {
            console.log(`${key}: ${value}`);
        });

        try {
            const response = await fetch('/api/createPost', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()
            console.log("Server Response:", data); // 追加

            if (response.ok) {
                // 成功時、トップページに遷移
                router.push('/')
                router.refresh()
            } else {
                alert(data.message || 'Post creation failed')
            }
        } catch (error) {
            console.error("Error:", error); // 追加
            alert('Something went wrong')
        }

        setLoading(false)
    }

    return (
        <div className="max-w-screen-md mx-auto">
            <form onSubmit={onSubmit}>
                <div className="mb-5">
                    <div className="text-sm mb-1">タイトル</div>
                    <input
                        className="w-full bg-gray-100 rounded border py-1 px-3 outline-none focus:bg-transparent focus:ring-2 focus:ring-yellow-500"
                        ref={titleRef}
                        type="text"
                        id="title"
                        placeholder="Title"
                        required
                    />
                </div>

                <div className="mb-5">
                    <div className="text-sm mb-1">画像</div>
                    <input
                        type="file"
                        id="thumnail"
                        onChange={onUploadImage}
                        required
                    />
                </div>

                <div className="mb-5">
                    <div className="text-sm mb-1">内容</div>
                    <textarea
                        className="w-full bg-gray-100 rounded border py-1 px-3 outline-none focus:bg-transparent focus:ring-2 focus:ring-yellow-500"
                        ref={contentRef}
                        id="content"
                        placeholder="Content"
                        rows={15}
                        required
                    />
                </div>

                <div className="text-center mb-5">
                    {loading ? (
                        <div>少々お待ちください・・</div>
                    ) : (
                        <button
                            type="submit"
                            className="w-full text-white bg-yellow-500 hover:brightness-110 rounded py-1 px-8"
                        >
                            作成
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}

export default NewPost
