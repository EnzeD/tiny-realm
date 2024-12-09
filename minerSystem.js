class MinerSystem {
    constructor() {
        this.miners = new Map(); // Key: "x,y", Value: { type: "wood"|"gold", count: number, lastMined: number, nextCost: number }
        this.BASE_COST = 10; // Starting cost
    }

    addMiner(x, y, type) {
        const key = `${x},${y}`;
        if (this.miners.has(key)) {
            const miner = this.miners.get(key);
            miner.count++;
            miner.nextCost *= 2; // Double the cost for next miner
        } else {
            this.miners.set(key, {
                type,
                count: 1,
                lastMined: Date.now(),
                nextCost: this.BASE_COST * 2 // Set initial next cost
            });
        }
    }

    getNextCost(x, y) {
        const key = `${x},${y}`;
        if (this.miners.has(key)) {
            return this.miners.get(key).nextCost;
        }
        return this.BASE_COST;
    }

    update() {
        const now = Date.now();

        this.miners.forEach((miner, key) => {
            // Calculate how many full seconds have passed
            const secondsPassed = Math.floor((now - miner.lastMined) / 1000);

            if (secondsPassed >= 1) {
                // Add resources (1 per miner per second)
                const resourcesToAdd = miner.count * secondsPassed;

                if (miner.type === "wood") {
                    window.woodSystem.addWood(resourcesToAdd);
                    console.log(`Added ${resourcesToAdd} wood from ${miner.count} miners at ${key}`);
                } else if (miner.type === "gold") {
                    window.goldSystem.addGold(resourcesToAdd);
                    console.log(`Added ${resourcesToAdd} gold from ${miner.count} miners at ${key}`);
                }

                // Update the last mined time by the number of full seconds that passed
                miner.lastMined += secondsPassed * 1000;
            }
        });
    }

    draw(ctx) {
        ctx.save();
        ctx.font = getFont('MINER_COUNT');
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        this.miners.forEach((miner, key) => {
            const [x, y] = key.split(",").map(Number);
            const screenPos = camera.worldToScreen(
                x * tileWidth * scale + (tileWidth * scale / 2),
                y * tileHeight * scale + (tileHeight * scale / 2)
            );

            // Draw count with shadow
            ctx.fillStyle = "black";
            ctx.fillText(`${miner.count}`, screenPos.x + 1, screenPos.y + 1);
            ctx.fillStyle = miner.type === "wood" ? "#8B4513" : "#FFD700";
            ctx.fillText(`${miner.count}`, screenPos.x, screenPos.y);
        });

        ctx.restore();
    }
}

// Create and attach to window
window.minerSystem = new MinerSystem(); 