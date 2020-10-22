export class Configure {
  static registerServiceWorker(directory: string): void {
    if ('serviceWorker' in navigator) {
        debugger;
        navigator.serviceWorker.getRegistration()
        navigator.serviceWorker.register(`${directory}/service-worker.js`)
            .then((registration) =>
                console.log(`Service Worker registration complete, scope: '${registration.scope}'`))
            .catch((error) =>
                console.log(`Service Worker registration failed with error: '${error}'`));
    }
  }
}