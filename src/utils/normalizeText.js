const normalizeText = (text) => {
    if (!text) return "";
    return text.trim().normalize("NFC").toLowerCase();
};

export { normalizeText };
