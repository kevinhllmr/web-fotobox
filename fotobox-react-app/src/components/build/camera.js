import initModule from './libapi.mjs';

// A helper that allows to distinguish critical errors from library errors.
export function rethrowIfCritical(err) {
    if (err?.constructor !== Error) {
        throw err;
    }
}

const INTERFACE_CLASS = 6; // PTP
const INTERFACE_SUBCLASS = 1; // MTP
let ModulePromise;

export class Camera {
    #queue = Promise.resolve();
    #context = null;

    static async showPicker() {
        try {
            const device = await navigator.usb.requestDevice({
                filters: [
                    {
                        classCode: INTERFACE_CLASS,
                        subclassCode: INTERFACE_SUBCLASS
                    }
                ]
            });
            console.log("Device selected:", device);
            return device;
        } catch (error) {
            console.error("Error selecting device:", error);
            throw error;
        }
    }

    async connect() {
        if (!ModulePromise) {
            console.log('Initializing WebAssembly module...');
            ModulePromise = initModule().catch(err => {
                console.error("Error loading WebAssembly module:", err);
                throw err;
            });
        }

        try {
            const Module = await ModulePromise;
            this.#context = new Module.Context();
            console.log('Camera context successfully initialized:', this.#context);

            // Log available methods on context
            console.log("Available methods in context:", Object.keys(this.#context));
        } catch (error) {
            console.error('Error initializing camera context:', error);
            rethrowIfCritical(error);
        }
    }

    async #schedule(op) {
        let res = this.#queue.then(() => op(this.#context));
        this.#queue = res.catch(rethrowIfCritical);
        return res;
    }

    async disconnect() {
        if (this.#context && !this.#context.isDeleted()) {
            console.log("Disconnecting camera context...");
            this.#context.delete();
        }
    }

    async getConfig() {
        return this.#schedule(context => {
            console.log("Getting configuration...");
            return context.configToJS();
        });
    }

    async getSupportedOps() {
        if (this.#context) {
            console.log("Verfügbare Methoden im Kontext:", Object.keys(this.#context));
            if (typeof this.#context.supportedOps === "function") {
                const ops = await this.#context.supportedOps();
                console.log("Unterstützte Operationen:", ops);
                return ops;
            } else {
                console.warn("supportedOps ist keine Funktion im Kontext.");
                return {};
            }
        }
        throw new Error('Kamera-Kontext nicht initialisiert.');
    }
    
    

    async setConfigValue(name, value) {
        console.log(`Setting config value: ${name} = ${value}`);
        let uiTimeout;
        await this.#schedule(context => {
            uiTimeout = new Promise(resolve => setTimeout(resolve, 800));
            return context.setConfigValue(name, value);
        });
        await uiTimeout;
    }

    async capturePreviewAsBlob() {
        console.log("Capturing preview as blob...");
        return this.#schedule(context => context.capturePreviewAsBlob());
    }

    async captureImageAsFile() {
        console.log("Capturing image as file...");
        return this.#schedule(context => context.captureImageAsFile());
    }

    async consumeEvents() {
        console.log("Consuming events...");
        return this.#schedule(context => context.consumeEvents());
    }
}
