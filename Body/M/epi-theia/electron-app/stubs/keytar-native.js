'use strict';

module.exports = {
    deletePassword() {
        return Promise.resolve(false);
    },
    findCredentials() {
        return Promise.resolve([]);
    },
    findPassword() {
        return Promise.resolve(null);
    },
    getPassword() {
        return Promise.resolve(null);
    },
    setPassword() {
        return Promise.resolve(false);
    }
};
