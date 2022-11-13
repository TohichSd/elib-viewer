import config from '../../config.json'
import Cookies from 'universal-cookie'
import { parse } from 'node-html-parser'

const cookies = new Cookies()
const proxyUrl = new URL(config.proxy)

type BookInfo = {
    available: boolean
    name: string
    pagesCount: number
}

export default class Library {
    public static async getDashboard() {
        return fetch(proxyUrl.href + 'dashboard.php', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'cookie': document.cookie
            }
        })
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
            redirect: 'manual',
            mode: 'cors',
            headers: {
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: urlEncodedData
        })

        const urlCheckCookie = proxyUrl.href +
            `login.php?cookieVerify=${cookies.get('CookieTestCookie')}&action=checkCookie`

        // Запрос для подтверждения куки
        await fetch(urlCheckCookie, {
            method: 'GET',
            credentials: 'include',
            redirect: 'manual',
            headers: {
                'cookie': document.cookie
            }
        })

        const dashboard = await Library.getDashboard()

        const text = await dashboard.text()
        return !text.includes('Вход')
    }

    public static async logout() {
        await fetch(proxyUrl.href + '/presentation/logout.php', {
            method: 'GET',
            credentials: 'include',
            redirect: 'follow',
            headers: {
                'cookie': document.cookie
            }
        })
    }

    public static async getBookPage(id: number, page: number): Promise<Blob> {
        const url = proxyUrl.href + `plugins/SecView/getDoc.php?id=${id}&page=${page}&type=small/fast`
        const bookPageResponse = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'cookie': document.cookie
            }
        })
        if (bookPageResponse.headers.get('content-type') == 'image/jpeg')
            return bookPageResponse.blob()
        else throw new Error('Cannot get page')
    }

    public static async getBookInfo(id: number): Promise<BookInfo> {
        const url = proxyUrl.href + '/action.php?kt_path_info=ktcore.SecViewPlugin.actions.document&fDocumentId=' + id
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'cookie': document.cookie
            }
        })
        const text = await response.text()
        const parsed = parse(text)
        // Нахождение количества страниц изх скрипта по регулярному выражению
        const pagesCount =  text.match(/'PageCount':'[0-9]+'/m)[0]
            .split(':')[1]
            .replace(/'/, '')
        return {
            available: !parsed.querySelector('.ktError'),
            name: parsed.querySelector('title').innerText,
            pagesCount: parseInt(pagesCount || '0')
        }
    }

    public static async isBookAvailable(id: number): Promise<boolean> {
        const response = await fetch(proxyUrl.href + 'view.php?fDocumentId=' + id, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'cookie': document.cookie
            }
        })
        const parsed = parse(await response.text())
        const error = parsed.querySelector('.ktError')
        return !error
    }
}