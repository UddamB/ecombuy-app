#[cxx::bridge]
mod ffi {
    unsafe extern "C++" {
        include!("src/lib.h");

        fn encrypt(key: &[u8], value: &[u8]) -> Result<String>;
        fn decrypt(key: &[u8], value: &str) -> Result<Vec<u8>>;
    }
}

pub fn encrypt(key: &[u8], value: &[u8]) -> Result<String, Error> {
    ffi::encrypt(key, value).map_err(|e| Error(format!("error during encryption: {}", e)))
}

pub fn decrypt(key: &[u8], value: &str) -> Result<Vec<u8>, Error> {
    ffi::decrypt(key, value).map_err(|e| Error(format!("error during decryption: {}", e)))
}

#[derive(Debug)]
pub struct Error(String);

impl std::error::Error for Error {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        None
    }
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.0)
    }
}

#[cfg(test)]
mod test {
    #[test]
    fn test_round_trips() {
        let input = &b"hello world!"[..];
        let key = &b"salt"[..];

        let encrypted = super::encrypt(key, input).expect("expected to encrypt");
        assert_ne!(encrypted, String::from_utf8_lossy(input));
        let decrypted = super::decrypt(key, &encrypted).expect("expected to decrypt");
        assert_eq!(&decrypted, input);
    }
}
