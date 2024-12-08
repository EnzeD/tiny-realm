const scale = 3;
const tileWidth = 8;
const tileHeight = 8;
const BASE_SPEED = 40;


const BUILDING_COSTS = {
    WOOD_MINER: {
        wood: 10
    }
};

// Text size configuration
const TEXT_CONFIG = {
    DEBUG: {
        size: 2 * scale,
        weight: 'normal'
    },
    FPS: {
        size: 8 * scale,
        weight: 'normal'
    },
    WOOD_COUNT: {
        size: 8 * scale,
        weight: 'normal'
    },
    FLOATING_TEXT: {
        size: 8 * scale,
        weight: 'normal'
    },
    COLLECT_PROMPT: {
        size: 8 * scale,
        weight: 'normal'
    },
    GAME_TITLE: {
        size: 14 * scale,
        weight: 'normal',
        text: 'Tiny Realm',
        fontFamily: 'Pixelated Elegance'
    },
    MENU_BUTTON: {
        size: 8 * scale,
        weight: 'normal',
        fontFamily: 'Simple Script',
        color: '#FFFFFF'
    },
    UPGRADE_BUTTON: {
        size: 8 * scale,
        weight: 'normal',
        fontFamily: 'Simple Script',
        color: '#FFFFFF'
    },
    NO_WOOD_WARNING: {
        size: 8 * scale,
        weight: 'normal',
        text: 'Need more wood for arrows!'
    },
    WAVE_COUNT: {
        size: 8 * scale,
        weight: 'normal',
    },
    WAVE_TIMER: {
        size: 6 * scale,
        weight: 'normal',
    },
    CASTLE_HP: {
        size: 8 * scale,
        weight: 'normal',
    }
};

// Text colors
const TEXT_COLORS = {
    main: "#fff1a9",  // Warm white/yellow color
};

// Text shadow configuration
const TEXT_SHADOW = {
    offset: Math.floor(1 * scale),
    color: "rgba(0, 0, 0, 0.5)"
};

// UI layout configuration
const UI_CONFIG = {
    padding: 8 * scale,  // Base padding (8 pixels * scale)
    positions: {
        WOOD_COUNT: {
            x: 6 * scale,  // Left padding
            y: 8 * scale   // Top padding
        },
        FPS: {
            x: -6 * scale,  // Right padding (negative for right alignment)
            y: 8 * scale    // Top padding
        },
        COLLECT_PROMPT: {
            x: 0,           // Center
            y: -8 * scale   // Bottom padding (negative for bottom alignment)
        },
        WAVE_COUNT: {
            x: 0,  // Center
            y: 8 * scale  // Top padding
        },
        WAVE_TIMER: {
            x: 0,  // Center
            y: 16 * scale  // Below wave count
        }
    }
};

// Helper function to get font string
function getFont(textType) {
    const config = TEXT_CONFIG[textType];
    if (!config) {
        console.warn(`No text configuration found for ${textType}`);
        return "16px 'Simple Script'";
    }
    const fontFamily = config.fontFamily || 'Simple Script';
    return `${config.weight} ${config.size}px '${fontFamily}'`;
}

// Helper function to draw shadowed text
function drawShadowedText(ctx, text, x, y, options = {}) {
    const originalFillStyle = ctx.fillStyle;
    const originalAlign = ctx.textAlign;
    const originalBaseline = ctx.textBaseline;

    // Apply options
    if (options.font) ctx.font = options.font;
    if (options.align) ctx.textAlign = options.align;
    if (options.baseline) ctx.textBaseline = options.baseline;

    // Draw shadow
    ctx.fillStyle = TEXT_SHADOW.color;
    ctx.fillText(text, Math.floor(x), Math.floor(y + TEXT_SHADOW.offset));

    // Draw main text
    ctx.fillStyle = options.color || TEXT_COLORS.main;  // Use the new color as default
    ctx.fillText(text, Math.floor(x), Math.floor(y));

    // Restore original context properties if they were changed
    if (options.align) ctx.textAlign = originalAlign;
    if (options.baseline) ctx.textBaseline = originalBaseline;
    ctx.fillStyle = originalFillStyle;
}

const ARCHER = {
    IDLE_FRAMES: [2115, 2116, 2117],
    ATTACK_FRAMES: [2179, 2180, 2181, 2182, 2183, 2184, 2185, 2186, 2187],
    IDLE_SPEED: 0.2,
    ATTACK_SPEED: 0.1,
    POSITIONS: [
        { x: 27, y: 14 },
        { x: 35, y: 14 },
        { x: 31, y: 9 }
    ]
};

// Add arrow cost
const ARROW_COST = 1;

const CASTLE = {
    HP: 100,
    CENTER: { x: 31, y: 13 }
};

const ENEMY = {
    FARMER1: {
        IDLE_FRAMES: [6666, 6667, 6668],
        ATTACK_FRAMES: [6730, 6731, 6732, 6733, 6734, 6735, 6736, 6737, 6738, 6739, 6740, 6741, 6742, 6743, 6744],
        HIT_FRAMES: [6772, 6763],
        IDLE_SPEED: 0.2,
        ATTACK_SPEED: 0.1,
        HIT_SPEED: 0.1
    },
    FARMER2: {
        IDLE_FRAMES: [7332, 7333, 7334],
        ATTACK_FRAMES: [7396, 7397, 7398, 7399, 7400, 7401, 7402, 7403, 7404, 7405, 7406, 7407, 7408, 7409, 7410],
        HIT_FRAMES: [7428, 7429],
        IDLE_SPEED: 0.2,
        ATTACK_SPEED: 0.1,
        HIT_SPEED: 0.1
    },
    WAVE_COUNTS: [12, 24, 48, 96, 192, 384, 500, 1000],
    WAVE_DELAY: 5 // seconds
};