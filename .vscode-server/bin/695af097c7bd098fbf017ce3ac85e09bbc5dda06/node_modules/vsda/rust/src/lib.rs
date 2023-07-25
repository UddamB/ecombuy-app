use base64::Engine;
use rand::prelude::*;
use sha2::{Digest, Sha256};

#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

// Total number of license slots. IMPORTANT: value must be single digit because of how the indexes are stored
const COUNT_LICENSES: usize = 10;

// Portions of the restricted license for the C# / C++ extensions to use
// as random text. 2 of these are selected at random for each handshake
const LICENSE_ARRAY: [&[u8]; COUNT_LICENSES] = [
    b"You may only use the C/C++ Extension for Visual Studio Code and C# Extension for Visual Studio Code",
    b"with Visual Studio Code, Visual Studio or Xamarin Studio software to help you develop and test your applications.",
    b"The software is licensed, not sold.",
    b"This agreement only gives you some rights to use the software.",
    b"Microsoft reserves all other rights",
    b"You may not work around any technical limitations in the software;",
    b"reverse engineer, decompile or disassemble the software",
    b"remove, minimize, block or modify any notices of Microsoft or ",
    b"its suppliers in the software share, publish, rent, or lease ",
    b"the software, or provide the software as a stand-alone hosted as solution for others to use."
];

// The number of license text chunks to be randomly selected and added to the string before hashing.
const HASHED_LICENSES: usize = 2;

// Total number of salt slots. IMPORTANT: must be single digit because of how the indexes are stored
// in the message.
const COUNT_SALTS: usize = 10;

// Salt values to append to the result as well. This includes non printable characters
// and makes brute forcing the result hash more difficult by causing rainbow tables
// to be of little use.
const SALT_ARRAY: [&[u8]; COUNT_SALTS] = [
    b"V+y,(H`v&A\\@x+;4GuK<$z]..?8#wVZn'*+}j1E\\$k0$/lvkpb846K:kf\"CI\\Yl*d4 / .R,{ ",
    b"B%&BH</'e{U`>F>ks3lkgSX>ETq{Vsu-i<kVc})P(H`wKlTvuPED>BLAX)C0X1sN\\[u4,H",
    b"bk@wJr&7h+N\\`Jfk4D$nbcdKen^VkOH<'KN:%uVO'G3ev#).$gM$r/==qtY]PJ[",
    b".owCo\\1\\B:964'42){c0<q,>\\\\1\" - !@1w}Xt",
    b"V'+|i5?}]WPLSze1WE6;'}Tg;83v8V2z}ov&x*",
    b"$Xjm#X:vcKdYn0VnkrLQDOwy\"; .3RBSW%RIdLOZ7(GKR / 1>(wcime:5qDs ? [l5b5DKR = 9",
    b"1UHJ^7Qt.SPtc<Q>6>#$jE+>>e\"P*Mb | bL / `H5'h7nP:ow + }zaqDB2,\"\\(86Xa",
    b";JNC{6bB,>R2GMy>t!&J^RSy}22@yP8|Q;ph:\\mjV=xL#y')y+N|c",
    b"/vJ{#Oc$xgduO$\\6UR>C_5s?M2X[eXma:)UyrxbK",
    b"?MY\",4_b9Lp\"yqGu37h4.}]w#(vbN0cK^?R]\"v<XFg$\\NZ`[K6",
];

/// Creates a salted message to use as a basis for signing/verification.
#[cfg_attr(feature = "wasm", wasm_bindgen(js_name = createNewMessage))]
pub fn create_new_message(original: &str) -> String {
    if original.len() < 4 {
        return String::new();
    }

    let mut hasher = Sha256::new();
    hasher.update(original);

    let mut rng = rand::thread_rng();
    let len = rng.gen_range(30..80);
    for _ in 0..len {
        hasher.update(&[rng.gen_range(b'!'..b'~')]);
    }

    base64_encode(hasher.finalize().as_slice())
}

/// Signs a salted message return from create_new_message.
#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn sign(salted_message: &str) -> String {
    if salted_message.len() < 4 {
        return String::new();
    }

    let mut hasher = Sha256::new();
    hasher.update(salted_message);

    let mut rng = rand::thread_rng();
    let mut indexes: [usize; HASHED_LICENSES + 1] = [0; HASHED_LICENSES + 1];
    for i in 0..HASHED_LICENSES {
        let index = rng.gen_range(0..COUNT_LICENSES);
        indexes[i] = index;
        hasher.update(LICENSE_ARRAY[index]);
    }

    let salt_index = rng.gen_range(0..COUNT_SALTS);
    indexes[HASHED_LICENSES] = salt_index;
    hasher.update(SALT_ARRAY[salt_index]);

    let mut final_value = String::new();
    for i in indexes {
        final_value.push_str(&i.to_string());
    }
    final_value.push_str(&base64_encode(hasher.finalize().as_slice()));

    final_value
}

/// Validates the signature for the given original message.
#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn validate(original_message: &str, signature: &str) -> bool {
    if signature.len() < COUNT_LICENSES + 2 {
        return false;
    }

    let mut hasher = Sha256::new();
    hasher.update(original_message);

    let mut final_value = String::new();
    for (i, chr) in signature.chars().take(HASHED_LICENSES + 1).enumerate() {
        if chr < '0' || chr > '9' {
            return false;
        }
        let index = (chr as usize) - (b'0' as usize);
        let arr = if i == HASHED_LICENSES {
            SALT_ARRAY
        } else {
            LICENSE_ARRAY
        };
        if index > arr.len() {
            return false;
        }

        hasher.update(arr[index]);
        final_value.push_str(&index.to_string());
    }

    final_value.push_str(&base64_encode(hasher.finalize().as_slice()));

    signature == final_value
}

/// Compatibility for histoic vsda interface
#[cfg(feature = "wasm")]
#[wasm_bindgen(js_name = signer)]
pub struct Signer {}

#[cfg(feature = "wasm")]
#[wasm_bindgen(js_class = signer)]
impl Signer {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Signer {
        Signer {}
    }

    #[wasm_bindgen]
    pub fn sign(&mut self, salted_message: &str) -> String {
        sign(salted_message)
    }
}


/// Compatibility for histoic vsda interface
#[cfg(feature = "wasm")]
#[wasm_bindgen(js_name = validator)]
pub struct Validator {
    salted_message: String,
}

#[cfg(feature = "wasm")]
#[wasm_bindgen(js_class = validator)]
impl Validator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Validator {
        Validator {
            salted_message: String::new(),
        }
    }

    #[wasm_bindgen(js_name = createNewMessage)]
    pub fn create_new_message(&mut self, original: &str) -> String {
        let msg = create_new_message(original);
        self.salted_message = msg.clone();
        msg
    }

    #[wasm_bindgen]
    pub fn validate(&mut self, signed_message: &str) -> String {
        match validate(&self.salted_message, signed_message) {
            true => "ok",
            false => "error"
        }.to_string()
    }
}

fn base64_encode(input: &[u8]) -> String {
    base64::engine::general_purpose::STANDARD.encode(input)
}

#[cfg(test)]
mod tests {
    use crate::{create_new_message, sign, validate};

    #[test]
    fn it_works() {
        let original = "test";

        let message = create_new_message(original);
        let signed_message = sign(&message);
        assert!(validate(&message, &signed_message));
    }
}
