#include "src/lib.h"
#include "encrypt.h"
#include <stdexcept>

rust::Vec<uint8_t> string_to_vec(std::string str) {
  rust::Vec<uint8_t> vec;

  vec.reserve(str.length());
  for (uint8_t c : str) {
    vec.push_back(c);
  }

  return vec;
}

rust::String encrypt(rust::Slice<const uint8_t> key,
                     rust::Slice<const uint8_t> value) {
  std::string result;
  std::string error;

  bool ok = Encryption::Encrypt(std::string(key.begin(), key.end()),
                                std::string(value.begin(), value.end()),
                                &result, &error);

  if (!ok) {
    throw std::logic_error(error);
  }

  return rust::String(result);
}

rust::Vec<uint8_t> decrypt(rust::Slice<const uint8_t> key, rust::Str value) {
  std::string result;
  std::string error;

  bool ok = Encryption::Decrypt(std::string(key.begin(), key.end()),
                                std::string(value), &result, &error);

  if (!ok) {
    throw std::logic_error(error);
  }

  return string_to_vec(result);
}
