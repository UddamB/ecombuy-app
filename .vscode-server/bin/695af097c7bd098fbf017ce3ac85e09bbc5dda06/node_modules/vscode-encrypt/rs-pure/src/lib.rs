use openssl::rand::rand_bytes;
use openssl::symm;

const SALT: [u8; 8] = [0xCF, 0x86, 0x46, 0x55, 0x69, 0x38, 0xC0, 0x71];
const NONCE_SEED_LENGTH: usize = 8;
const TAG_LENGTH: usize = 16;

pub fn encrypt(key: &[u8], value: &[u8]) -> Result<String, Error> {
    let mut hashed_key = create_key(key)?;
    let mut nonce_seed: [u8; NONCE_SEED_LENGTH] = [0; NONCE_SEED_LENGTH];
    rand_bytes(&mut nonce_seed).unwrap();
    hashed_key.extend_from_slice(&nonce_seed);

    let cipher = symm::Cipher::aes_256_gcm();
    let (key, iv) = evp_bytes_to_key(cipher, &SALT[..], &hashed_key, 1)?;

    let mut tag = [0; TAG_LENGTH];
    let mut enc = symm::encrypt_aead(cipher, &key, Some(&iv), &[], value, &mut tag)
        .expect("expected to encrypt");
    enc.extend_from_slice(&nonce_seed);
    enc.extend_from_slice(&tag);
    Ok(base64::encode(enc))
}

pub fn decrypt(key: &[u8], value: &str) -> Result<Vec<u8>, Error> {
    let enc = base64::decode(value).map_err(|_| Error("Invalid base64 data".to_string()))?;
    if enc.len() < NONCE_SEED_LENGTH + TAG_LENGTH {
        return Err(Error("Value too short".to_string()));
    }

    let tag_start = enc.len() - TAG_LENGTH;
    let nonce_start = tag_start - NONCE_SEED_LENGTH;
    let mut hashed_key = create_key(key)?;
    hashed_key.extend_from_slice(&enc[nonce_start..tag_start]);

    let cipher = symm::Cipher::aes_256_gcm();
    let (key, iv) = evp_bytes_to_key(cipher, &SALT[..], &hashed_key, 1)?;

    let dec = symm::decrypt_aead(
        cipher,
        &key,
        Some(&iv),
        &[],
        &enc[..nonce_start],
        &enc[tag_start..],
    )
    .map_err(|_| Error::generic())?;

    Ok(dec)
}

#[cfg(unix)]
fn create_key(key: &[u8]) -> Result<Vec<u8>, Error> {
    use openssl::hash::{Hasher, MessageDigest};

    let exe = std::env::current_exe().map_err(|_| Error::generic())?;
    let exe = exe.to_string_lossy();
    let mut exe = exe.as_ref();

    // SNAP is set to the directory where the snap is mounted when running in a snap package. This snap path has a version number in it
    // which can't be used to reliably encrypt/decrypt after a version update. to get around this, we check for the SNAP environment
    // variable and remove that from the process path. What’s left over is /usr/bin/code (or similar) which is perfect to be used in the encryption.
    // More info: https://snapcraft.io/docs/environment-variables
    if cfg!(target_os = "linux") {
        if let Ok(snap) = std::env::var("SNAP") {
            if exe.contains(&snap) {
                exe = &exe[snap.len()..];
            }
        }
    }

    let mut h = Hasher::new(MessageDigest::sha256()).unwrap();
    h.update(key).unwrap();
    h.update(exe.as_bytes()).unwrap();
    Ok(h.finish().unwrap().to_vec())
}

#[cfg(windows)]
fn create_key(key: &[u8]) -> Result<Vec<u8>, Error> {
    use openssl::hash::{Hasher, MessageDigest};

    let mut h = Hasher::new(MessageDigest::sha256()).unwrap();
    h.update(key).unwrap();
    h.update(b"33000001df6bf02e92a74ab4d00000000001df").unwrap();
    Ok(h.finish().unwrap().to_vec())
}

pub fn evp_bytes_to_key(
    cipher: symm::Cipher,
    salt: &[u8],
    data: &[u8],
    hashes: i32,
) -> Result<(Vec<u8>, Vec<u8>), Error> {
    let p = openssl::pkcs5::bytes_to_key(
        cipher,
        openssl::hash::MessageDigest::sha256(),
        data,
        Some(salt),
        hashes,
    )
    .map_err(|e| Error(format!("key derivation failed: {}", e)))?;
    Ok((p.key, p.iv.expect("gcm should have iv")))
}

#[derive(Debug)]
pub struct Error(String);

impl Error {
    /// Returns a generic errror -- used in many cases to avoid leaking
    /// internals about waht is used for state.
    fn generic() -> Error {
        Error("Cryptography failed".to_string())
    }
}

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

    #[test]
    fn test_does_not_reuse_nonce() {
        let input = &b"hello world!"[..];
        let key = &b"salt"[..];

        let encrypted1 = super::encrypt(key, input).expect("expected to encrypt");
        let encrypted2 = super::encrypt(key, input).expect("expected to encrypt");
        assert_ne!(encrypted1, encrypted2);
    }

    #[test]
    fn test_different_salts_encrypt_different() {
        let input = &b"hello world!"[..];

        let encrypted = super::encrypt(&b"salt"[..], input).expect("expected to encrypt");
        assert_ne!(encrypted, String::from_utf8_lossy(input));
        super::decrypt(&b"pepper"[..], &encrypted).expect_err("expected *not* to decrypt");
    }
}
