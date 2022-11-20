import config from '../../config.json'
import { parse } from 'node-html-parser'

const proxyUrl = new URL(config.proxy)

type BookInfo = {
    available: boolean
    name: string
    pagesCount: number
}

type LibraryErrorOptions = {
    message?: string
    code?: number
}

class LibraryError extends Error {
    public code?: number

    constructor(options: LibraryErrorOptions) {
        super(options.message)
        if (options.code)
            this.code = options.code
    }
}

export default class Library {
    public static async getDashboard() {
        const response = await fetch(proxyUrl.href + 'dashboard.php', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'cookie': document.cookie
            }
        })
        if (!response.ok) throw new LibraryError({ message: 'Cannot fetch page', code: response.status })
        return response
    }

    public static async login(username, password): Promise<boolean> {
        const data = {
            username: username,
            password: password,
            language: 'ru_UN',
            action: 'login'
        }

        const urlEncodedData = Object.keys(data)
            .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k])).join('&')


        // Этот запрос нужен для получения куки из библиотеки
        await fetch(proxyUrl.href + 'login.php', {
            method: 'POST',
            credentials: 'include',
            redirect: 'follow',
            mode: 'cors',
            headers: {
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: urlEncodedData
        })

        // const testCookie = cookies.get('CookieTestCookie')
        // if (!testCookie) throw new Error('Cannot get CookieTestCookie')
        /*const urlCheckCookie = proxyUrl.href +
            `login.php?cookieVerify=${cookies.get('CookieTestCookie')}&action=checkCookie`

        // Запрос для подтверждения куки
        await fetch(urlCheckCookie, {
            method: 'GET',
            credentials: 'include',
            redirect: 'manual',
        })*/

        const dashboard = await Library.getDashboard()

        const text = await dashboard.text()
        return !text.includes('Вход')
    }

    public static async logout() {
        const response = await fetch(proxyUrl.href + 'presentation/logout.php', {
            method: 'GET',
            credentials: 'include',
            redirect: 'manual',
        })
        if (!response.ok) throw new LibraryError({ message: 'Cannot fetch page', code: response.status })
    }

    public static async getBookPage(id: number, page: number): Promise<Blob> {
        const url = proxyUrl.href + `plugins/SecView/getDoc.php?id=${id}&page=${page}&type=small/fast`
        const bookPageResponse = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        })
        if (!bookPageResponse.ok) throw new LibraryError({
            message: 'Cannot fetch page',
            code: bookPageResponse.status
        })
        if (bookPageResponse.headers.get('content-type') == 'image/jpeg')
            return bookPageResponse.blob()
        else throw new Error('Cannot get book page')
    }

    public static async getBookInfo(id: number): Promise<BookInfo> {
        const url = proxyUrl.href + 'action.php?kt_path_info=ktcore.SecViewPlugin.actions.document&fDocumentId=' + id
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        })
        if (!response.ok) throw new LibraryError({ message: 'Cannot fetch page', code: response.status })
        const text = await response.text()
        const parsed = parse(text)

        // Нахождение количества страниц из скрипта по регулярному выражению
        const pagesCountStr = text.match(/'PageCount':'[0-9]+'/m)
        let pagesCount: number
        if (pagesCountStr) {
            pagesCount = parseInt(pagesCountStr[0]
                .split(':')[1]
                .replace(/'/, ''))
        } else pagesCount = 0

        const content = parsed.querySelector('#content').innerText
        return {
            available: !(content.includes('Доступ Запрещен') || content.includes('Ошибка')),
            name: parsed.querySelector('title').innerText,
            pagesCount
        }
    }
}