'use strict';
// Startup-critical scheduler extracted from core-v3. It is intentionally tiny.
// core-v3 reuses this instance when it is later initialized lazily.
module.exports = function initScheduler(site) {
    if (site.scheduler) return site.scheduler;
    const scheduled = new Map();
    site.scheduler = {
        later(name, ms, fn) {
            this.cancel(name);
            const timer = setTimeout(async () => {
                scheduled.delete(String(name));
                try { await fn(); } catch (err) { site.events.emit('scheduler.error', { name, err }); }
            }, Math.max(0, Number(ms || 0)));
            if (timer.unref) timer.unref();
            scheduled.set(String(name), { type: 'timeout', timer });
            return timer;
        },
        every(name, ms, fn) {
            this.cancel(name);
            const timer = setInterval(async () => {
                const item = scheduled.get(String(name));
                if (!item || item.running) return;
                item.running = true;
                try { await fn(); } catch (err) { site.events.emit('scheduler.error', { name, err }); }
                finally { item.running = false; }
            }, Math.max(1, Number(ms || 1)));
            if (timer.unref) timer.unref();
            scheduled.set(String(name), { type: 'interval', timer, running: false });
            return timer;
        },
        cancel(name) {
            const item = scheduled.get(String(name));
            if (!item) return false;
            if (item.type === 'interval') clearInterval(item.timer); else clearTimeout(item.timer);
            scheduled.delete(String(name));
            return true;
        },
        clear() { for (const key of Array.from(scheduled.keys())) this.cancel(key); },
        list() { return Array.from(scheduled.keys()); },
    };
    return site.scheduler;
};
