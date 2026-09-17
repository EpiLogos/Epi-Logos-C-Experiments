//! A bounds-checked little-endian cursor over the transaction log bytes.
//!
//! Neo4j 5 writes its transaction log little-endian (`KernelVersion
//! VERSION_LITTLE_ENDIAN_TX_LOG_INTRODUCED`). Every read is checked: running off
//! the end is an error the caller must handle, never a silently truncated value.

use std::fmt;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CursorError {
    Eof { needed: usize, available: usize },
    Malformed(&'static str),
}

impl fmt::Display for CursorError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Eof { needed, available } => {
                write!(f, "unexpected end of log: needed {needed} bytes, {available} available")
            }
            Self::Malformed(m) => write!(f, "malformed log data: {m}"),
        }
    }
}

impl std::error::Error for CursorError {}

pub struct Cursor<'a> {
    data: &'a [u8],
    pos: usize,
}

impl<'a> Cursor<'a> {
    pub fn new(data: &'a [u8]) -> Self {
        Self { data, pos: 0 }
    }

    pub fn at(data: &'a [u8], pos: usize) -> Self {
        Self { data, pos }
    }

    pub fn position(&self) -> usize {
        self.pos
    }

    pub fn set_position(&mut self, pos: usize) {
        self.pos = pos;
    }

    pub fn remaining(&self) -> usize {
        self.data.len().saturating_sub(self.pos)
    }

    pub fn peek_u8(&self) -> Option<u8> {
        self.data.get(self.pos).copied()
    }

    fn take(&mut self, n: usize) -> Result<&'a [u8], CursorError> {
        if self.remaining() < n {
            return Err(CursorError::Eof { needed: n, available: self.remaining() });
        }
        let slice = &self.data[self.pos..self.pos + n];
        self.pos += n;
        Ok(slice)
    }

    pub fn bytes(&mut self, n: usize) -> Result<&'a [u8], CursorError> {
        self.take(n)
    }

    pub fn u8(&mut self) -> Result<u8, CursorError> {
        Ok(self.take(1)?[0])
    }

    pub fn i16(&mut self) -> Result<i16, CursorError> {
        let b = self.take(2)?;
        Ok(i16::from_le_bytes([b[0], b[1]]))
    }

    pub fn i32(&mut self) -> Result<i32, CursorError> {
        let b = self.take(4)?;
        Ok(i32::from_le_bytes([b[0], b[1], b[2], b[3]]))
    }

    pub fn i64(&mut self) -> Result<i64, CursorError> {
        let b = self.take(8)?;
        Ok(i64::from_le_bytes([b[0], b[1], b[2], b[3], b[4], b[5], b[6], b[7]]))
    }

    pub fn f32(&mut self) -> Result<f32, CursorError> {
        Ok(f32::from_bits(self.i32()? as u32))
    }

    pub fn f64(&mut self) -> Result<f64, CursorError> {
        Ok(f64::from_bits(self.i64()? as u64))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_little_endian() {
        let data = [0x01, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        let mut c = Cursor::new(&data);
        assert_eq!(c.i32().unwrap(), 1);
        assert_eq!(c.i64().unwrap(), 2);
    }

    #[test]
    fn running_off_the_end_is_an_error_not_a_truncated_value() {
        let data = [0x01, 0x02];
        let mut c = Cursor::new(&data);
        let err = c.i64().unwrap_err();
        assert_eq!(err, CursorError::Eof { needed: 8, available: 2 });
    }
}
