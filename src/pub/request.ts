interface ReturnBase<T> {
  data: T;
  code: number;
  message?: string;
  errMsg?: string;
}

export type RequestReturn<T> = Promise<ReturnBase<T>>

interface RequestConfig<T> {
  url: string;
  method?: 'GET' | 'POST';
  data?: T;
  useMessage?: boolean;
  headers?: Record<string, string> | false,
  multipart?: boolean;
}

const request = <R = {}, T = {}>(config: RequestConfig<T>) => {
  config.method = config.method ?? 'GET';
  config.useMessage = config.useMessage ?? true;
  config.multipart = config.multipart ?? false;
  if (config.method === 'GET' && config.data) {
    config.url += convertToUrlParams(config.data)
  }
  return fetch(config.url, {
    method: config.method,
    credentials:'include',
    body: config.multipart
      ? config.data ? convertToFormData(config.data) : null
      : config.method === 'POST'
        ? JSON.stringify(config.data || {})
        : undefined,
    headers:
      config.headers === false
        ? undefined
        : config.headers === undefined
          ? { 'Content-Type': 'application/json; charset=utf-8' }
          : config.headers
  })
    .then(res => res.json())
    .then((res: ReturnBase<R>): Promise<R> => {
      return new Promise((resolve, reject) => {
        if (res.code === 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      })
    }).catch((error: ReturnBase<R>) => {
      if (config.useMessage) {
        // Message.error(error.errMsg || '')
      }
      return Promise.reject(error)
    })
}

export default request



const convertToUrlParams = (data: any) => {
  let params = "?"
  const keys = Object.keys(data)
  keys.forEach((key, index) => {
    params += `${key}=${data[key]}${index !== keys.length - 1 ? "&" : ""}`
  })
  return params
}


const convertToFormData = (data: Record<string, any>) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (key === "file" && Array.isArray(data[key])) {
      data[key].forEach((ele: any) => {
        formData.append(key, ele);
      });
    } else {
      formData.append(key, data[key]);
    }
  });
  return formData;
}