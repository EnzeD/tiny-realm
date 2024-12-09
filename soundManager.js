class SoundManager {
    constructor() {
        // Initialize sound collections
        this.sounds = {
            bow: [
                new Audio('sounds/bow1.mp3'),
                new Audio('sounds/bow2.mp3')
            ],
            woodChop: [
                new Audio('sounds/woodchop.mp3'),

            ],
            music: []
        };

        // Set volume for all bow sounds to 20%
        this.sounds.bow.forEach(sound => {
            sound.volume = 0.2;
        });

        // Set volume for wood chop sounds to 30%
        this.sounds.woodChop.forEach(sound => {
            sound.volume = 0.2;
        });

        // Initialize properties
        this.currentMusic = null;
        this.isMuted = false;
        this.musicVolume = 0.2;
    }

    playRandomBowSound() {
        if (this.isMuted) return;

        const bowSounds = this.sounds.bow;
        const randomIndex = Math.floor(Math.random() * bowSounds.length);
        bowSounds[randomIndex].currentTime = 0; // Reset sound to start
        bowSounds[randomIndex].play();
    }

    playMusic(musicPath) {
        if (this.isMuted) return;

        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.removeEventListener('ended', this.handleMusicEnd);
        }

        const music = new Audio(musicPath);
        music.loop = true;  // Native loop property
        music.volume = this.musicVolume;

        // Backup loop handler in case native loop doesn't work
        this.handleMusicEnd = () => {
            music.currentTime = 0;
            music.play();
        };
        music.addEventListener('ended', this.handleMusicEnd);

        music.play().catch(error => {
            console.warn('Audio play failed:', error);
            // Try to play again when user interacts with the page
            document.addEventListener('click', () => {
                music.play();
            }, { once: true });
        });

        this.currentMusic = music;
    }

    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.removeEventListener('ended', this.handleMusicEnd);
            this.currentMusic = null;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted && this.currentMusic) {
            this.currentMusic.pause();
        } else if (!this.isMuted && this.currentMusic) {
            this.currentMusic.play();
        }
    }

    setMusicVolume(volume) {
        this.musicVolume = volume;
        if (this.currentMusic) {
            this.currentMusic.volume = volume;
        }
    }

    playRandomWoodChopSound() {
        if (this.isMuted) return;

        const woodChopSounds = this.sounds.woodChop;
        const randomIndex = Math.floor(Math.random() * woodChopSounds.length);
        woodChopSounds[randomIndex].currentTime = 0;
        woodChopSounds[randomIndex].play();
    }
}

// Create global instance
window.soundManager = new SoundManager(); 