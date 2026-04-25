/**
 * AUTO-GENERATED. Do not edit by hand.
 *
 * Source: apps/web/public/openapi.yaml
 * Generator: openapi-typescript
 * Regenerate: pnpm --filter @nocensor/sdk generate
 */
/* eslint-disable */
// prettier-ignore

export interface paths {
    "/api/v1/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Health check */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Service is healthy. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["HealthResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/account": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get current account */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Account details. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["AccountResponse"];
                    };
                };
                /** @description Missing or invalid API key. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/credits": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get remaining credits */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Credit balance. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CreditsResponse"];
                    };
                };
                /** @description Missing or invalid API key. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/generate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Generate an image
         * @description Submit a prompt (and optional source image for img2img) to generate an SDXL image.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["GenerateRequest"];
                };
            };
            responses: {
                /** @description Job accepted and queued for processing. */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["JobAcceptedResponse"];
                    };
                };
                /** @description Invalid request. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Missing or invalid API key. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Insufficient credits. */
                402: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Payload too large. */
                413: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Validation error. */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Rate limit exceeded. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description GPU capacity unavailable. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/video": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Generate a video (txt2video or img2video) */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["VideoRequest"];
                };
            };
            responses: {
                /** @description Job accepted and queued for processing. */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["JobAcceptedResponse"];
                    };
                };
                /** @description Invalid request. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Missing or invalid API key. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Insufficient credits. */
                402: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Validation error. */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Rate limit exceeded. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description GPU capacity unavailable. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/undress": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Undress an image (requires biometric consent) */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        source: string;
                        /** @enum {boolean} */
                        biometric_consent: true;
                    };
                };
            };
            responses: {
                /** @description Job accepted and queued for processing. */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["JobAcceptedResponse"];
                    };
                };
                /** @description Invalid request. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Missing or invalid API key. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Insufficient credits. */
                402: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Validation error. */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Rate limit exceeded. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/face-swap": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Face-swap an image (requires biometric consent) */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["FaceSwapRequest"];
                };
            };
            responses: {
                /** @description Job accepted and queued for processing. */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["JobAcceptedResponse"];
                    };
                };
                /** @description Invalid request. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Missing or invalid API key. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Insufficient credits. */
                402: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Validation error. */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Rate limit exceeded. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/enhance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Enhance an image
         * @description Run a single enhancement op (upscale, face-restore, bg-replace, attach-object).
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /** @enum {string} */
                        operation: "upscale";
                        source: string;
                        /** @default 2 */
                        scale?: number;
                    } | {
                        /** @enum {string} */
                        operation: "face-restore";
                        source: string;
                    } | {
                        /** @enum {string} */
                        operation: "bg-replace";
                        source: string;
                        background_prompt: string;
                    } | {
                        /** @enum {string} */
                        operation: "attach-object";
                        source: string;
                        object_prompt: string;
                        mask: string;
                    };
                };
            };
            responses: {
                /** @description Job accepted and queued for processing. */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["JobAcceptedResponse"];
                    };
                };
                /** @description Invalid request. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Missing or invalid API key. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Insufficient credits. */
                402: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Validation error. */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Rate limit exceeded. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/pipelines": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Run a multi-stage pipeline */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        stages: [
                        ] | [
                            {
                                /** @enum {string} */
                                op: "generate";
                                prompt: string;
                                negative_prompt?: string;
                                model?: string;
                                loras?: [
                                ] | [
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    }
                                ] | [
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    },
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    }
                                ];
                                width?: number;
                                height?: number;
                                seed?: number;
                            } | {
                                /** @enum {string} */
                                op: "undress";
                                /** @enum {boolean} */
                                biometric_consent: true;
                            } | {
                                /** @enum {string} */
                                op: "face-swap";
                                /** @enum {boolean} */
                                biometric_consent: true;
                                /** Format: uuid */
                                face_model_id?: string;
                                face?: string;
                            } | {
                                /** @enum {string} */
                                op: "upscale";
                                /** @default 2 */
                                scale?: number;
                            } | {
                                /** @enum {string} */
                                op: "face-restore";
                            } | {
                                /** @enum {string} */
                                op: "bg-replace";
                                background_prompt: string;
                            } | {
                                /** @enum {string} */
                                op: "attach-object";
                                object_prompt: string;
                                mask: string;
                            } | {
                                /** @enum {string} */
                                op: "animate";
                                motion_prompt: string;
                                frames?: number;
                            } | {
                                /** @enum {string} */
                                op: "redress";
                                /** @enum {boolean} */
                                biometric_consent: true;
                                clothing_prompt: string;
                            }
                        ] | [
                            {
                                /** @enum {string} */
                                op: "generate";
                                prompt: string;
                                negative_prompt?: string;
                                model?: string;
                                loras?: [
                                ] | [
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    }
                                ] | [
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    },
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    }
                                ];
                                width?: number;
                                height?: number;
                                seed?: number;
                            } | {
                                /** @enum {string} */
                                op: "undress";
                                /** @enum {boolean} */
                                biometric_consent: true;
                            } | {
                                /** @enum {string} */
                                op: "face-swap";
                                /** @enum {boolean} */
                                biometric_consent: true;
                                /** Format: uuid */
                                face_model_id?: string;
                                face?: string;
                            } | {
                                /** @enum {string} */
                                op: "upscale";
                                /** @default 2 */
                                scale?: number;
                            } | {
                                /** @enum {string} */
                                op: "face-restore";
                            } | {
                                /** @enum {string} */
                                op: "bg-replace";
                                background_prompt: string;
                            } | {
                                /** @enum {string} */
                                op: "attach-object";
                                object_prompt: string;
                                mask: string;
                            } | {
                                /** @enum {string} */
                                op: "animate";
                                motion_prompt: string;
                                frames?: number;
                            } | {
                                /** @enum {string} */
                                op: "redress";
                                /** @enum {boolean} */
                                biometric_consent: true;
                                clothing_prompt: string;
                            },
                            {
                                /** @enum {string} */
                                op: "generate";
                                prompt: string;
                                negative_prompt?: string;
                                model?: string;
                                loras?: [
                                ] | [
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    }
                                ] | [
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    },
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    }
                                ];
                                width?: number;
                                height?: number;
                                seed?: number;
                            } | {
                                /** @enum {string} */
                                op: "undress";
                                /** @enum {boolean} */
                                biometric_consent: true;
                            } | {
                                /** @enum {string} */
                                op: "face-swap";
                                /** @enum {boolean} */
                                biometric_consent: true;
                                /** Format: uuid */
                                face_model_id?: string;
                                face?: string;
                            } | {
                                /** @enum {string} */
                                op: "upscale";
                                /** @default 2 */
                                scale?: number;
                            } | {
                                /** @enum {string} */
                                op: "face-restore";
                            } | {
                                /** @enum {string} */
                                op: "bg-replace";
                                background_prompt: string;
                            } | {
                                /** @enum {string} */
                                op: "attach-object";
                                object_prompt: string;
                                mask: string;
                            } | {
                                /** @enum {string} */
                                op: "animate";
                                motion_prompt: string;
                                frames?: number;
                            } | {
                                /** @enum {string} */
                                op: "redress";
                                /** @enum {boolean} */
                                biometric_consent: true;
                                clothing_prompt: string;
                            }
                        ] | [
                            {
                                /** @enum {string} */
                                op: "generate";
                                prompt: string;
                                negative_prompt?: string;
                                model?: string;
                                loras?: [
                                ] | [
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    }
                                ] | [
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    },
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    }
                                ];
                                width?: number;
                                height?: number;
                                seed?: number;
                            } | {
                                /** @enum {string} */
                                op: "undress";
                                /** @enum {boolean} */
                                biometric_consent: true;
                            } | {
                                /** @enum {string} */
                                op: "face-swap";
                                /** @enum {boolean} */
                                biometric_consent: true;
                                /** Format: uuid */
                                face_model_id?: string;
                                face?: string;
                            } | {
                                /** @enum {string} */
                                op: "upscale";
                                /** @default 2 */
                                scale?: number;
                            } | {
                                /** @enum {string} */
                                op: "face-restore";
                            } | {
                                /** @enum {string} */
                                op: "bg-replace";
                                background_prompt: string;
                            } | {
                                /** @enum {string} */
                                op: "attach-object";
                                object_prompt: string;
                                mask: string;
                            } | {
                                /** @enum {string} */
                                op: "animate";
                                motion_prompt: string;
                                frames?: number;
                            } | {
                                /** @enum {string} */
                                op: "redress";
                                /** @enum {boolean} */
                                biometric_consent: true;
                                clothing_prompt: string;
                            },
                            {
                                /** @enum {string} */
                                op: "generate";
                                prompt: string;
                                negative_prompt?: string;
                                model?: string;
                                loras?: [
                                ] | [
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    }
                                ] | [
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    },
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    }
                                ];
                                width?: number;
                                height?: number;
                                seed?: number;
                            } | {
                                /** @enum {string} */
                                op: "undress";
                                /** @enum {boolean} */
                                biometric_consent: true;
                            } | {
                                /** @enum {string} */
                                op: "face-swap";
                                /** @enum {boolean} */
                                biometric_consent: true;
                                /** Format: uuid */
                                face_model_id?: string;
                                face?: string;
                            } | {
                                /** @enum {string} */
                                op: "upscale";
                                /** @default 2 */
                                scale?: number;
                            } | {
                                /** @enum {string} */
                                op: "face-restore";
                            } | {
                                /** @enum {string} */
                                op: "bg-replace";
                                background_prompt: string;
                            } | {
                                /** @enum {string} */
                                op: "attach-object";
                                object_prompt: string;
                                mask: string;
                            } | {
                                /** @enum {string} */
                                op: "animate";
                                motion_prompt: string;
                                frames?: number;
                            } | {
                                /** @enum {string} */
                                op: "redress";
                                /** @enum {boolean} */
                                biometric_consent: true;
                                clothing_prompt: string;
                            },
                            {
                                /** @enum {string} */
                                op: "generate";
                                prompt: string;
                                negative_prompt?: string;
                                model?: string;
                                loras?: [
                                ] | [
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    }
                                ] | [
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    },
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    }
                                ];
                                width?: number;
                                height?: number;
                                seed?: number;
                            } | {
                                /** @enum {string} */
                                op: "undress";
                                /** @enum {boolean} */
                                biometric_consent: true;
                            } | {
                                /** @enum {string} */
                                op: "face-swap";
                                /** @enum {boolean} */
                                biometric_consent: true;
                                /** Format: uuid */
                                face_model_id?: string;
                                face?: string;
                            } | {
                                /** @enum {string} */
                                op: "upscale";
                                /** @default 2 */
                                scale?: number;
                            } | {
                                /** @enum {string} */
                                op: "face-restore";
                            } | {
                                /** @enum {string} */
                                op: "bg-replace";
                                background_prompt: string;
                            } | {
                                /** @enum {string} */
                                op: "attach-object";
                                object_prompt: string;
                                mask: string;
                            } | {
                                /** @enum {string} */
                                op: "animate";
                                motion_prompt: string;
                                frames?: number;
                            } | {
                                /** @enum {string} */
                                op: "redress";
                                /** @enum {boolean} */
                                biometric_consent: true;
                                clothing_prompt: string;
                            }
                        ] | [
                            {
                                /** @enum {string} */
                                op: "generate";
                                prompt: string;
                                negative_prompt?: string;
                                model?: string;
                                loras?: [
                                ] | [
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    }
                                ] | [
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    },
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    }
                                ];
                                width?: number;
                                height?: number;
                                seed?: number;
                            } | {
                                /** @enum {string} */
                                op: "undress";
                                /** @enum {boolean} */
                                biometric_consent: true;
                            } | {
                                /** @enum {string} */
                                op: "face-swap";
                                /** @enum {boolean} */
                                biometric_consent: true;
                                /** Format: uuid */
                                face_model_id?: string;
                                face?: string;
                            } | {
                                /** @enum {string} */
                                op: "upscale";
                                /** @default 2 */
                                scale?: number;
                            } | {
                                /** @enum {string} */
                                op: "face-restore";
                            } | {
                                /** @enum {string} */
                                op: "bg-replace";
                                background_prompt: string;
                            } | {
                                /** @enum {string} */
                                op: "attach-object";
                                object_prompt: string;
                                mask: string;
                            } | {
                                /** @enum {string} */
                                op: "animate";
                                motion_prompt: string;
                                frames?: number;
                            } | {
                                /** @enum {string} */
                                op: "redress";
                                /** @enum {boolean} */
                                biometric_consent: true;
                                clothing_prompt: string;
                            },
                            {
                                /** @enum {string} */
                                op: "generate";
                                prompt: string;
                                negative_prompt?: string;
                                model?: string;
                                loras?: [
                                ] | [
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    }
                                ] | [
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    },
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    }
                                ];
                                width?: number;
                                height?: number;
                                seed?: number;
                            } | {
                                /** @enum {string} */
                                op: "undress";
                                /** @enum {boolean} */
                                biometric_consent: true;
                            } | {
                                /** @enum {string} */
                                op: "face-swap";
                                /** @enum {boolean} */
                                biometric_consent: true;
                                /** Format: uuid */
                                face_model_id?: string;
                                face?: string;
                            } | {
                                /** @enum {string} */
                                op: "upscale";
                                /** @default 2 */
                                scale?: number;
                            } | {
                                /** @enum {string} */
                                op: "face-restore";
                            } | {
                                /** @enum {string} */
                                op: "bg-replace";
                                background_prompt: string;
                            } | {
                                /** @enum {string} */
                                op: "attach-object";
                                object_prompt: string;
                                mask: string;
                            } | {
                                /** @enum {string} */
                                op: "animate";
                                motion_prompt: string;
                                frames?: number;
                            } | {
                                /** @enum {string} */
                                op: "redress";
                                /** @enum {boolean} */
                                biometric_consent: true;
                                clothing_prompt: string;
                            },
                            {
                                /** @enum {string} */
                                op: "generate";
                                prompt: string;
                                negative_prompt?: string;
                                model?: string;
                                loras?: [
                                ] | [
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    }
                                ] | [
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    },
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    }
                                ];
                                width?: number;
                                height?: number;
                                seed?: number;
                            } | {
                                /** @enum {string} */
                                op: "undress";
                                /** @enum {boolean} */
                                biometric_consent: true;
                            } | {
                                /** @enum {string} */
                                op: "face-swap";
                                /** @enum {boolean} */
                                biometric_consent: true;
                                /** Format: uuid */
                                face_model_id?: string;
                                face?: string;
                            } | {
                                /** @enum {string} */
                                op: "upscale";
                                /** @default 2 */
                                scale?: number;
                            } | {
                                /** @enum {string} */
                                op: "face-restore";
                            } | {
                                /** @enum {string} */
                                op: "bg-replace";
                                background_prompt: string;
                            } | {
                                /** @enum {string} */
                                op: "attach-object";
                                object_prompt: string;
                                mask: string;
                            } | {
                                /** @enum {string} */
                                op: "animate";
                                motion_prompt: string;
                                frames?: number;
                            } | {
                                /** @enum {string} */
                                op: "redress";
                                /** @enum {boolean} */
                                biometric_consent: true;
                                clothing_prompt: string;
                            },
                            {
                                /** @enum {string} */
                                op: "generate";
                                prompt: string;
                                negative_prompt?: string;
                                model?: string;
                                loras?: [
                                ] | [
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    }
                                ] | [
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    },
                                    {
                                        /** Format: uuid */
                                        id: string;
                                        strength: number;
                                    }
                                ];
                                width?: number;
                                height?: number;
                                seed?: number;
                            } | {
                                /** @enum {string} */
                                op: "undress";
                                /** @enum {boolean} */
                                biometric_consent: true;
                            } | {
                                /** @enum {string} */
                                op: "face-swap";
                                /** @enum {boolean} */
                                biometric_consent: true;
                                /** Format: uuid */
                                face_model_id?: string;
                                face?: string;
                            } | {
                                /** @enum {string} */
                                op: "upscale";
                                /** @default 2 */
                                scale?: number;
                            } | {
                                /** @enum {string} */
                                op: "face-restore";
                            } | {
                                /** @enum {string} */
                                op: "bg-replace";
                                background_prompt: string;
                            } | {
                                /** @enum {string} */
                                op: "attach-object";
                                object_prompt: string;
                                mask: string;
                            } | {
                                /** @enum {string} */
                                op: "animate";
                                motion_prompt: string;
                                frames?: number;
                            } | {
                                /** @enum {string} */
                                op: "redress";
                                /** @enum {boolean} */
                                biometric_consent: true;
                                clothing_prompt: string;
                            }
                        ];
                        source?: string;
                        webhook_event_id_prefix?: string;
                    };
                };
            };
            responses: {
                /** @description Job accepted and queued for processing. */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["JobAcceptedResponse"];
                    };
                };
                /** @description Invalid request. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Missing or invalid API key. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Insufficient credits. */
                402: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Validation error. */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Rate limit exceeded. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/pipelines/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get pipeline status */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Pipeline record. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["PipelineResponse"];
                    };
                };
                /** @description Missing or invalid API key. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/jobs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List recent jobs */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description List of jobs. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["JobListResponse"];
                    };
                };
                /** @description Missing or invalid API key. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/jobs/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a job by ID */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Job record. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["JobResponse"];
                    };
                };
                /** @description Missing or invalid API key. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Job not found. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/models": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List available models */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description List of models. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ModelListResponse"];
                    };
                };
                /** @description Missing or invalid API key. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List recent payments */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Payment history. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["PaymentListResponse"];
                    };
                };
                /** @description Missing or invalid API key. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/webhooks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List webhooks */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Webhook list. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WebhookListResponse"];
                    };
                };
                /** @description Missing or invalid API key. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        put?: never;
        /** Create a webhook */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /** Format: uri */
                        url: string;
                        events: ("job.completed" | "job.failed" | "job.cancelled" | "payment.completed" | "lora.training_completed" | "lora.training_failed" | "pipeline.completed" | "webhook.test")[];
                    };
                };
            };
            responses: {
                /** @description Webhook created. */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WebhookResponse"];
                    };
                };
                /** @description Missing or invalid API key. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Validation error. */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/webhooks/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete a webhook */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Webhook deleted. */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Missing or invalid API key. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Webhook not found. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        /** Update a webhook */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /** Format: uri */
                        url?: string;
                        events?: ("job.completed" | "job.failed" | "job.cancelled" | "payment.completed" | "lora.training_completed" | "lora.training_failed" | "pipeline.completed" | "webhook.test")[];
                        is_active?: boolean;
                    };
                };
            };
            responses: {
                /** @description Updated webhook. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WebhookUpdatedResponse"];
                    };
                };
                /** @description Missing or invalid API key. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Webhook not found. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        trace?: never;
    };
    "/api/v1/webhooks/{id}/deliveries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List webhook deliveries */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Delivery history. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WebhookDeliveryListResponse"];
                    };
                };
                /** @description Missing or invalid API key. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/webhooks/{id}/test": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Send a test event to a webhook */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Test delivery queued. */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WebhookTestResponse"];
                    };
                };
                /** @description Missing or invalid API key. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Webhook not found. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        CreateWebhookRequest: {
            /** Format: uri */
            url: string;
            events: ("job.completed" | "job.failed" | "job.cancelled" | "payment.completed" | "lora.training_completed" | "lora.training_failed" | "pipeline.completed" | "webhook.test")[];
        };
        UpdateWebhookRequest: {
            /** Format: uri */
            url?: string;
            events?: ("job.completed" | "job.failed" | "job.cancelled" | "payment.completed" | "lora.training_completed" | "lora.training_failed" | "pipeline.completed" | "webhook.test")[];
            is_active?: boolean;
        };
        EnhanceRequest: {
            /** @enum {string} */
            operation: "upscale";
            source: string;
            /** @default 2 */
            scale: number;
        } | {
            /** @enum {string} */
            operation: "face-restore";
            source: string;
        } | {
            /** @enum {string} */
            operation: "bg-replace";
            source: string;
            background_prompt: string;
        } | {
            /** @enum {string} */
            operation: "attach-object";
            source: string;
            object_prompt: string;
            mask: string;
        };
        UndressRequest: {
            source: string;
            /** @enum {boolean} */
            biometric_consent: true;
        };
        PipelineRequest: {
            stages: [
            ] | [
                {
                    /** @enum {string} */
                    op: "generate";
                    prompt: string;
                    negative_prompt?: string;
                    model?: string;
                    loras?: [
                    ] | [
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        }
                    ] | [
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        },
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        }
                    ];
                    width?: number;
                    height?: number;
                    seed?: number;
                } | {
                    /** @enum {string} */
                    op: "undress";
                    /** @enum {boolean} */
                    biometric_consent: true;
                } | {
                    /** @enum {string} */
                    op: "face-swap";
                    /** @enum {boolean} */
                    biometric_consent: true;
                    /** Format: uuid */
                    face_model_id?: string;
                    face?: string;
                } | {
                    /** @enum {string} */
                    op: "upscale";
                    /** @default 2 */
                    scale: number;
                } | {
                    /** @enum {string} */
                    op: "face-restore";
                } | {
                    /** @enum {string} */
                    op: "bg-replace";
                    background_prompt: string;
                } | {
                    /** @enum {string} */
                    op: "attach-object";
                    object_prompt: string;
                    mask: string;
                } | {
                    /** @enum {string} */
                    op: "animate";
                    motion_prompt: string;
                    frames?: number;
                } | {
                    /** @enum {string} */
                    op: "redress";
                    /** @enum {boolean} */
                    biometric_consent: true;
                    clothing_prompt: string;
                }
            ] | [
                {
                    /** @enum {string} */
                    op: "generate";
                    prompt: string;
                    negative_prompt?: string;
                    model?: string;
                    loras?: [
                    ] | [
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        }
                    ] | [
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        },
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        }
                    ];
                    width?: number;
                    height?: number;
                    seed?: number;
                } | {
                    /** @enum {string} */
                    op: "undress";
                    /** @enum {boolean} */
                    biometric_consent: true;
                } | {
                    /** @enum {string} */
                    op: "face-swap";
                    /** @enum {boolean} */
                    biometric_consent: true;
                    /** Format: uuid */
                    face_model_id?: string;
                    face?: string;
                } | {
                    /** @enum {string} */
                    op: "upscale";
                    /** @default 2 */
                    scale: number;
                } | {
                    /** @enum {string} */
                    op: "face-restore";
                } | {
                    /** @enum {string} */
                    op: "bg-replace";
                    background_prompt: string;
                } | {
                    /** @enum {string} */
                    op: "attach-object";
                    object_prompt: string;
                    mask: string;
                } | {
                    /** @enum {string} */
                    op: "animate";
                    motion_prompt: string;
                    frames?: number;
                } | {
                    /** @enum {string} */
                    op: "redress";
                    /** @enum {boolean} */
                    biometric_consent: true;
                    clothing_prompt: string;
                },
                {
                    /** @enum {string} */
                    op: "generate";
                    prompt: string;
                    negative_prompt?: string;
                    model?: string;
                    loras?: [
                    ] | [
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        }
                    ] | [
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        },
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        }
                    ];
                    width?: number;
                    height?: number;
                    seed?: number;
                } | {
                    /** @enum {string} */
                    op: "undress";
                    /** @enum {boolean} */
                    biometric_consent: true;
                } | {
                    /** @enum {string} */
                    op: "face-swap";
                    /** @enum {boolean} */
                    biometric_consent: true;
                    /** Format: uuid */
                    face_model_id?: string;
                    face?: string;
                } | {
                    /** @enum {string} */
                    op: "upscale";
                    /** @default 2 */
                    scale: number;
                } | {
                    /** @enum {string} */
                    op: "face-restore";
                } | {
                    /** @enum {string} */
                    op: "bg-replace";
                    background_prompt: string;
                } | {
                    /** @enum {string} */
                    op: "attach-object";
                    object_prompt: string;
                    mask: string;
                } | {
                    /** @enum {string} */
                    op: "animate";
                    motion_prompt: string;
                    frames?: number;
                } | {
                    /** @enum {string} */
                    op: "redress";
                    /** @enum {boolean} */
                    biometric_consent: true;
                    clothing_prompt: string;
                }
            ] | [
                {
                    /** @enum {string} */
                    op: "generate";
                    prompt: string;
                    negative_prompt?: string;
                    model?: string;
                    loras?: [
                    ] | [
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        }
                    ] | [
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        },
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        }
                    ];
                    width?: number;
                    height?: number;
                    seed?: number;
                } | {
                    /** @enum {string} */
                    op: "undress";
                    /** @enum {boolean} */
                    biometric_consent: true;
                } | {
                    /** @enum {string} */
                    op: "face-swap";
                    /** @enum {boolean} */
                    biometric_consent: true;
                    /** Format: uuid */
                    face_model_id?: string;
                    face?: string;
                } | {
                    /** @enum {string} */
                    op: "upscale";
                    /** @default 2 */
                    scale: number;
                } | {
                    /** @enum {string} */
                    op: "face-restore";
                } | {
                    /** @enum {string} */
                    op: "bg-replace";
                    background_prompt: string;
                } | {
                    /** @enum {string} */
                    op: "attach-object";
                    object_prompt: string;
                    mask: string;
                } | {
                    /** @enum {string} */
                    op: "animate";
                    motion_prompt: string;
                    frames?: number;
                } | {
                    /** @enum {string} */
                    op: "redress";
                    /** @enum {boolean} */
                    biometric_consent: true;
                    clothing_prompt: string;
                },
                {
                    /** @enum {string} */
                    op: "generate";
                    prompt: string;
                    negative_prompt?: string;
                    model?: string;
                    loras?: [
                    ] | [
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        }
                    ] | [
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        },
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        }
                    ];
                    width?: number;
                    height?: number;
                    seed?: number;
                } | {
                    /** @enum {string} */
                    op: "undress";
                    /** @enum {boolean} */
                    biometric_consent: true;
                } | {
                    /** @enum {string} */
                    op: "face-swap";
                    /** @enum {boolean} */
                    biometric_consent: true;
                    /** Format: uuid */
                    face_model_id?: string;
                    face?: string;
                } | {
                    /** @enum {string} */
                    op: "upscale";
                    /** @default 2 */
                    scale: number;
                } | {
                    /** @enum {string} */
                    op: "face-restore";
                } | {
                    /** @enum {string} */
                    op: "bg-replace";
                    background_prompt: string;
                } | {
                    /** @enum {string} */
                    op: "attach-object";
                    object_prompt: string;
                    mask: string;
                } | {
                    /** @enum {string} */
                    op: "animate";
                    motion_prompt: string;
                    frames?: number;
                } | {
                    /** @enum {string} */
                    op: "redress";
                    /** @enum {boolean} */
                    biometric_consent: true;
                    clothing_prompt: string;
                },
                {
                    /** @enum {string} */
                    op: "generate";
                    prompt: string;
                    negative_prompt?: string;
                    model?: string;
                    loras?: [
                    ] | [
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        }
                    ] | [
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        },
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        }
                    ];
                    width?: number;
                    height?: number;
                    seed?: number;
                } | {
                    /** @enum {string} */
                    op: "undress";
                    /** @enum {boolean} */
                    biometric_consent: true;
                } | {
                    /** @enum {string} */
                    op: "face-swap";
                    /** @enum {boolean} */
                    biometric_consent: true;
                    /** Format: uuid */
                    face_model_id?: string;
                    face?: string;
                } | {
                    /** @enum {string} */
                    op: "upscale";
                    /** @default 2 */
                    scale: number;
                } | {
                    /** @enum {string} */
                    op: "face-restore";
                } | {
                    /** @enum {string} */
                    op: "bg-replace";
                    background_prompt: string;
                } | {
                    /** @enum {string} */
                    op: "attach-object";
                    object_prompt: string;
                    mask: string;
                } | {
                    /** @enum {string} */
                    op: "animate";
                    motion_prompt: string;
                    frames?: number;
                } | {
                    /** @enum {string} */
                    op: "redress";
                    /** @enum {boolean} */
                    biometric_consent: true;
                    clothing_prompt: string;
                }
            ] | [
                {
                    /** @enum {string} */
                    op: "generate";
                    prompt: string;
                    negative_prompt?: string;
                    model?: string;
                    loras?: [
                    ] | [
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        }
                    ] | [
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        },
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        }
                    ];
                    width?: number;
                    height?: number;
                    seed?: number;
                } | {
                    /** @enum {string} */
                    op: "undress";
                    /** @enum {boolean} */
                    biometric_consent: true;
                } | {
                    /** @enum {string} */
                    op: "face-swap";
                    /** @enum {boolean} */
                    biometric_consent: true;
                    /** Format: uuid */
                    face_model_id?: string;
                    face?: string;
                } | {
                    /** @enum {string} */
                    op: "upscale";
                    /** @default 2 */
                    scale: number;
                } | {
                    /** @enum {string} */
                    op: "face-restore";
                } | {
                    /** @enum {string} */
                    op: "bg-replace";
                    background_prompt: string;
                } | {
                    /** @enum {string} */
                    op: "attach-object";
                    object_prompt: string;
                    mask: string;
                } | {
                    /** @enum {string} */
                    op: "animate";
                    motion_prompt: string;
                    frames?: number;
                } | {
                    /** @enum {string} */
                    op: "redress";
                    /** @enum {boolean} */
                    biometric_consent: true;
                    clothing_prompt: string;
                },
                {
                    /** @enum {string} */
                    op: "generate";
                    prompt: string;
                    negative_prompt?: string;
                    model?: string;
                    loras?: [
                    ] | [
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        }
                    ] | [
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        },
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        }
                    ];
                    width?: number;
                    height?: number;
                    seed?: number;
                } | {
                    /** @enum {string} */
                    op: "undress";
                    /** @enum {boolean} */
                    biometric_consent: true;
                } | {
                    /** @enum {string} */
                    op: "face-swap";
                    /** @enum {boolean} */
                    biometric_consent: true;
                    /** Format: uuid */
                    face_model_id?: string;
                    face?: string;
                } | {
                    /** @enum {string} */
                    op: "upscale";
                    /** @default 2 */
                    scale: number;
                } | {
                    /** @enum {string} */
                    op: "face-restore";
                } | {
                    /** @enum {string} */
                    op: "bg-replace";
                    background_prompt: string;
                } | {
                    /** @enum {string} */
                    op: "attach-object";
                    object_prompt: string;
                    mask: string;
                } | {
                    /** @enum {string} */
                    op: "animate";
                    motion_prompt: string;
                    frames?: number;
                } | {
                    /** @enum {string} */
                    op: "redress";
                    /** @enum {boolean} */
                    biometric_consent: true;
                    clothing_prompt: string;
                },
                {
                    /** @enum {string} */
                    op: "generate";
                    prompt: string;
                    negative_prompt?: string;
                    model?: string;
                    loras?: [
                    ] | [
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        }
                    ] | [
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        },
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        }
                    ];
                    width?: number;
                    height?: number;
                    seed?: number;
                } | {
                    /** @enum {string} */
                    op: "undress";
                    /** @enum {boolean} */
                    biometric_consent: true;
                } | {
                    /** @enum {string} */
                    op: "face-swap";
                    /** @enum {boolean} */
                    biometric_consent: true;
                    /** Format: uuid */
                    face_model_id?: string;
                    face?: string;
                } | {
                    /** @enum {string} */
                    op: "upscale";
                    /** @default 2 */
                    scale: number;
                } | {
                    /** @enum {string} */
                    op: "face-restore";
                } | {
                    /** @enum {string} */
                    op: "bg-replace";
                    background_prompt: string;
                } | {
                    /** @enum {string} */
                    op: "attach-object";
                    object_prompt: string;
                    mask: string;
                } | {
                    /** @enum {string} */
                    op: "animate";
                    motion_prompt: string;
                    frames?: number;
                } | {
                    /** @enum {string} */
                    op: "redress";
                    /** @enum {boolean} */
                    biometric_consent: true;
                    clothing_prompt: string;
                },
                {
                    /** @enum {string} */
                    op: "generate";
                    prompt: string;
                    negative_prompt?: string;
                    model?: string;
                    loras?: [
                    ] | [
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        }
                    ] | [
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        },
                        {
                            /** Format: uuid */
                            id: string;
                            strength: number;
                        }
                    ];
                    width?: number;
                    height?: number;
                    seed?: number;
                } | {
                    /** @enum {string} */
                    op: "undress";
                    /** @enum {boolean} */
                    biometric_consent: true;
                } | {
                    /** @enum {string} */
                    op: "face-swap";
                    /** @enum {boolean} */
                    biometric_consent: true;
                    /** Format: uuid */
                    face_model_id?: string;
                    face?: string;
                } | {
                    /** @enum {string} */
                    op: "upscale";
                    /** @default 2 */
                    scale: number;
                } | {
                    /** @enum {string} */
                    op: "face-restore";
                } | {
                    /** @enum {string} */
                    op: "bg-replace";
                    background_prompt: string;
                } | {
                    /** @enum {string} */
                    op: "attach-object";
                    object_prompt: string;
                    mask: string;
                } | {
                    /** @enum {string} */
                    op: "animate";
                    motion_prompt: string;
                    frames?: number;
                } | {
                    /** @enum {string} */
                    op: "redress";
                    /** @enum {boolean} */
                    biometric_consent: true;
                    clothing_prompt: string;
                }
            ];
            source?: string;
            webhook_event_id_prefix?: string;
        };
        Health: {
            /** @enum {string} */
            status: "ok";
            version?: string;
        };
        Meta: {
            request_id: string;
        } & {
            [key: string]: unknown;
        };
        HealthResponse: {
            data: components["schemas"]["Health"];
            meta: components["schemas"]["Meta"];
        };
        Account: {
            /** Format: uuid */
            user_id: string;
            /** Format: email */
            email: string | null;
            credits_remaining: number;
        };
        AccountResponse: {
            data: components["schemas"]["Account"];
            meta: components["schemas"]["Meta"];
        };
        ErrorObject: {
            code: string;
            message: string;
            status: number;
            request_id: string;
        };
        ErrorResponse: {
            error: components["schemas"]["ErrorObject"];
        };
        Credits: {
            credits_remaining: number;
        };
        CreditsResponse: {
            data: components["schemas"]["Credits"];
            meta: components["schemas"]["Meta"];
        };
        JobAccepted: {
            id: string;
            /** @enum {string} */
            status: "pending";
            /** Format: date-time */
            created_at: string;
        };
        JobAcceptedResponse: {
            data: components["schemas"]["JobAccepted"];
            meta: components["schemas"]["Meta"];
        };
        GenerateRequest: {
            prompt: string;
            negativePrompt?: string;
            /**
             * @default realistic
             * @enum {string}
             */
            model: "realistic" | "photoreal-plus" | "anime" | "hentai" | "stylized" | "chroma";
            seed?: number;
            image?: string;
            denoise?: number;
            loras?: [
            ] | [
                {
                    /** Format: uuid */
                    id: string;
                    strength?: number;
                }
            ] | [
                {
                    /** Format: uuid */
                    id: string;
                    strength?: number;
                },
                {
                    /** Format: uuid */
                    id: string;
                    strength?: number;
                }
            ];
        };
        VideoRequest: {
            prompt: string;
            negativePrompt?: string;
            image?: string;
            /** @enum {string} */
            duration?: "short" | "medium" | "long" | "long-plus";
            seed?: number;
        };
        FaceSwapRequest: {
            source: string;
            /** Format: uuid */
            face_model_id?: string;
            face?: string;
            /** @enum {boolean} */
            biometric_consent: true;
        };
        Job: {
            id: string;
            workflow_id: string;
            /** @enum {string} */
            status: "pending" | "processing" | "completed" | "failed" | "cancelled";
            /** Format: date-time */
            created_at: string;
            /** Format: date-time */
            completed_at?: string | null;
            error_message?: string | null;
            credits_charged?: number | null;
            /** Format: uri */
            output_url?: string | null;
        };
        PipelineResponse: {
            data: components["schemas"]["Job"];
            meta: components["schemas"]["Meta"];
        };
        JobListResponse: {
            data: components["schemas"]["Job"][];
            meta: components["schemas"]["Meta"];
        };
        JobResponse: {
            data: components["schemas"]["Job"];
            meta: components["schemas"]["Meta"];
        };
        ModelListResponse: {
            data: {
                id: string;
                name: string;
            }[];
            meta: components["schemas"]["Meta"];
        };
        PaymentListResponse: {
            data: {
                /** Format: uuid */
                id: string;
                amount_usd: number;
                gateway: string;
                status: string;
                /** Format: date-time */
                created_at: string;
            }[];
            meta: components["schemas"]["Meta"];
        };
        Webhook: {
            /** Format: uuid */
            id: string;
            /** Format: uri */
            url: string;
            events: string[];
            is_active: boolean;
            /** Format: date-time */
            created_at: string;
        };
        WebhookListResponse: {
            data: components["schemas"]["Webhook"][];
            meta: components["schemas"]["Meta"];
        };
        WebhookResponse: {
            data: components["schemas"]["Webhook"];
            meta: components["schemas"]["Meta"];
        };
        WebhookUpdatedResponse: {
            data: components["schemas"]["Webhook"];
            meta: components["schemas"]["Meta"];
        };
        WebhookDeliveryListResponse: {
            data: {
                /** Format: uuid */
                id: string;
                event_type: string;
                status: string;
                attempts: number;
                /** Format: date-time */
                created_at: string;
            }[];
            meta: components["schemas"]["Meta"];
        };
        WebhookTestResponse: {
            data: {
                delivered: boolean;
            };
            meta: components["schemas"]["Meta"];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
