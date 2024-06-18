"use strict";

class Ex {
  constructor(e, a = !1) {
    (this.littleEndian = !1),
      (this.position = 0),
      (this.EEndOfBuffer = "No more data to read"),
      (this.littleEndian = a),
      (this.buffer = e),
      (this.bytes = new Uint8Array(e));
  }
  get LittleEndian() {
    return this.littleEndian;
  }
  ReadByte() {
    if (this.position >= this.buffer.byteLength) throw Error(this.EEndOfBuffer);
    return this.bytes[this.position++];
  }
  ReadUInt16() {
    return this.littleEndian
      ? this.ReadByte() | (this.ReadByte() << 8)
      : (this.ReadByte() << 8) | this.ReadByte();
  }
  ReadInt16() {
    var e = this.ReadUInt16();
    return e >= 32768 ? e - 65536 : e;
  }
  ReadUInt32() {
    return this.littleEndian
      ? this.ReadUInt16() | (this.ReadUInt16() << 16)
      : (this.ReadUInt16() << 16) | this.ReadUInt16();
  }
  ReadInt32() {
    var e = this.ReadUInt32();
    return e >= 2147483648 ? e - 4294967296 : e;
  }
  ReadFloat() {
    if (this.position + 3 >= this.bytes.byteLength)
      throw Error(this.EEndOfBuffer);
    let e = new DataView(this.buffer).getFloat32(this.position, !1);
    return (this.position += 4), e;
  }
  ReadDouble() {
    if (this.position + 7 >= this.bytes.byteLength)
      throw Error(this.EEndOfBuffer);
    let e = new DataView(this.buffer).getFloat64(this.position, !1);
    return (this.position += 8), e;
  }
  ReadBoundedString8() {
    let e = this.ReadByte();
    return this.ReadBoundedString(e);
  }
  ReadBoundedString16(e = !1) {
    let a = 0;
    if (e) {
      (this.littleEndian = !1),
        (a = this.ReadUInt16()),
        (this.littleEndian = !0),
        (this.position -= 2);
      let i = this.ReadUInt16();
      i < a ? (a = i) : (this.littleEndian = !1);
    } else a = this.ReadUInt16();
    return this.ReadBoundedString(a);
  }
  ReadBoundedString32() {
    let e = this.ReadUInt32();
    return this.ReadBoundedString(e);
  }
  ReadBoundedString(e) {
    let a = [];
    for (let i = 0; i < e; i++) {
      let s = this.ReadByte();
      a.push(String.fromCharCode(s));
    }
    return a.join("");
  }
  ReadTerminatedString(e) {
    let a = [],
      i;
    for (; (i = this.ReadByte()) > 0; ) a.push(String.fromCharCode(i));
    return a.join("");
  }
  ReadByteArray(e) {
    if (this.position + e > this.buffer.byteLength)
      throw Error(this.EEndOfBuffer);
    return (
      (this.position += e), this.buffer.slice(this.position - e, this.position)
    );
  }
  get Position() {
    return this.position;
  }
  get Size() {
    return this.buffer.byteLength;
  }
  get HasMoreData() {
    return this.position < this.Size;
  }
}
function Ih(e) {
  let a = e.length;
  for (; --a >= 0; ) e[a] = 0;
}
const Fx = new Uint8Array([
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5,
    5, 5, 5, 0,
  ]),
  Dv = new Uint8Array([
    0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10,
    11, 11, 12, 12, 13, 13,
  ]),
  Fde = new Uint8Array([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7,
  ]),
  jL = new Uint8Array([
    16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
  ]),
  Cl = Array(576);
Ih(Cl);
const cm = Array(60);
Ih(cm);
const dm = Array(512);
Ih(dm);
const um = Array(256);
Ih(um);
const Nx = Array(29);
Ih(Nx);
const kv = Array(30);
function Lx(e, a, i, s, n) {
  (this.static_tree = e),
    (this.extra_bits = a),
    (this.extra_base = i),
    (this.elems = s),
    (this.max_length = n),
    (this.has_stree = e && e.length);
}
Ih(kv);
let $L, zL, WL;
function Bx(e, a) {
  (this.dyn_tree = e), (this.max_code = 0), (this.stat_desc = a);
}
const KL = (e) => (e < 256 ? dm[e] : dm[256 + (e >>> 7)]),
  hm = (e, a) => {
    (e.pending_buf[e.pending++] = 255 & a),
      (e.pending_buf[e.pending++] = (a >>> 8) & 255);
  },
  Na = (e, a, i) => {
    e.bi_valid > 16 - i
      ? ((e.bi_buf |= (a << e.bi_valid) & 65535),
        hm(e, e.bi_buf),
        (e.bi_buf = a >> (16 - e.bi_valid)),
        (e.bi_valid += i - 16))
      : ((e.bi_buf |= (a << e.bi_valid) & 65535), (e.bi_valid += i));
  },
  Oo = (e, a, i) => {
    Na(e, i[2 * a], i[2 * a + 1]);
  },
  qL = (e, a) => {
    let i = 0;
    do (i |= 1 & e), (e >>>= 1), (i <<= 1);
    while (--a > 0);
    return i >>> 1;
  },
  YL = (e, a, i) => {
    let s = Array(16),
      n,
      r,
      l = 0;
    for (n = 1; n <= 15; n++) (l = (l + i[n - 1]) << 1), (s[n] = l);
    for (r = 0; r <= a; r++) {
      let h = e[2 * r + 1];
      0 !== h && (e[2 * r] = qL(s[h]++, h));
    }
  },
  QL = (e) => {
    let a;
    for (a = 0; a < 286; a++) e.dyn_ltree[2 * a] = 0;
    for (a = 0; a < 30; a++) e.dyn_dtree[2 * a] = 0;
    for (a = 0; a < 19; a++) e.bl_tree[2 * a] = 0;
    (e.dyn_ltree[512] = 1),
      (e.opt_len = e.static_len = 0),
      (e.sym_next = e.matches = 0);
  },
  ZL = (e) => {
    e.bi_valid > 8
      ? hm(e, e.bi_buf)
      : e.bi_valid > 0 && (e.pending_buf[e.pending++] = e.bi_buf),
      (e.bi_buf = 0),
      (e.bi_valid = 0);
  },
  JL = (e, a, i, s) => {
    let n = 2 * a,
      r = 2 * i;
    return e[n] < e[r] || (e[n] === e[r] && s[a] <= s[i]);
  },
  Hx = (e, a, i) => {
    let s = e.heap[i],
      n = i << 1;
    for (
      ;
      n <= e.heap_len &&
      (n < e.heap_len && JL(a, e.heap[n + 1], e.heap[n], e.depth) && n++,
      !JL(a, s, e.heap[n], e.depth));

    )
      (e.heap[i] = e.heap[n]), (i = n), (n <<= 1);
    e.heap[i] = s;
  },
  XL = (e, a, i) => {
    let s,
      n,
      r,
      l,
      h = 0;
    if (0 !== e.sym_next)
      do
        (s = 255 & e.pending_buf[e.sym_buf + h++]),
          (s += (255 & e.pending_buf[e.sym_buf + h++]) << 8),
          (n = e.pending_buf[e.sym_buf + h++]),
          0 === s
            ? Oo(e, n, a)
            : (Oo(e, (r = um[n]) + 256 + 1, a),
              0 !== (l = Fx[r]) && Na(e, (n -= Nx[r]), l),
              (r = KL(--s)),
              Oo(e, r, i),
              0 !== (l = Dv[r]) && Na(e, (s -= kv[r]), l));
      while (h < e.sym_next);
    Oo(e, 256, a);
  },
  Vx = (e, a) => {
    let i = a.dyn_tree,
      s = a.stat_desc.static_tree,
      n = a.stat_desc.has_stree,
      r = a.stat_desc.elems,
      l,
      h,
      o,
      d = -1;
    for (e.heap_len = 0, e.heap_max = 573, l = 0; l < r; l++)
      0 !== i[2 * l]
        ? ((e.heap[++e.heap_len] = d = l), (e.depth[l] = 0))
        : (i[2 * l + 1] = 0);
    for (; e.heap_len < 2; )
      (i[2 * (o = e.heap[++e.heap_len] = d < 2 ? ++d : 0)] = 1),
        (e.depth[o] = 0),
        e.opt_len--,
        n && (e.static_len -= s[2 * o + 1]);
    for (a.max_code = d, l = e.heap_len >> 1; l >= 1; l--) Hx(e, i, l);
    o = r;
    do
      (l = e.heap[1]),
        (e.heap[1] = e.heap[e.heap_len--]),
        Hx(e, i, 1),
        (h = e.heap[1]),
        (e.heap[--e.heap_max] = l),
        (e.heap[--e.heap_max] = h),
        (i[2 * o] = i[2 * l] + i[2 * h]),
        (e.depth[o] = (e.depth[l] >= e.depth[h] ? e.depth[l] : e.depth[h]) + 1),
        (i[2 * l + 1] = i[2 * h + 1] = o),
        (e.heap[1] = o++),
        Hx(e, i, 1);
    while (e.heap_len >= 2);
    (e.heap[--e.heap_max] = e.heap[1]),
      ((e, a) => {
        let i = a.dyn_tree,
          s = a.max_code,
          n = a.stat_desc.static_tree,
          r = a.stat_desc.has_stree,
          l = a.stat_desc.extra_bits,
          h = a.stat_desc.extra_base,
          o = a.stat_desc.max_length,
          d,
          _,
          $,
          u,
          f,
          c,
          m = 0;
        for (u = 0; u <= 15; u++) e.bl_count[u] = 0;
        for (
          i[2 * e.heap[e.heap_max] + 1] = 0, d = e.heap_max + 1;
          d < 573;
          d++
        )
          (u = i[2 * i[2 * (_ = e.heap[d]) + 1] + 1] + 1) > o && ((u = o), m++),
            (i[2 * _ + 1] = u),
            !(_ > s) &&
              (e.bl_count[u]++,
              (f = 0),
              _ >= h && (f = l[_ - h]),
              (c = i[2 * _]),
              (e.opt_len += c * (u + f)),
              r && (e.static_len += c * (n[2 * _ + 1] + f)));
        if (0 !== m) {
          do {
            for (u = o - 1; 0 === e.bl_count[u]; ) u--;
            e.bl_count[u]--,
              (e.bl_count[u + 1] += 2),
              e.bl_count[o]--,
              (m -= 2);
          } while (m > 0);
          for (u = o; 0 !== u; u--)
            for (_ = e.bl_count[u]; 0 !== _; )
              !(($ = e.heap[--d]) > s) &&
                (i[2 * $ + 1] !== u &&
                  ((e.opt_len += (u - i[2 * $ + 1]) * i[2 * $]),
                  (i[2 * $ + 1] = u)),
                _--);
        }
      })(e, a),
      YL(i, d, e.bl_count);
  },
  e6 = (e, a, i) => {
    let s,
      n,
      r = -1,
      l = a[1],
      h = 0,
      o = 7,
      d = 4;
    for (
      0 === l && ((o = 138), (d = 3)), a[2 * (i + 1) + 1] = 65535, s = 0;
      s <= i;
      s++
    )
      (n = l),
        (l = a[2 * (s + 1) + 1]),
        (++h < o && n === l) ||
          (h < d
            ? (e.bl_tree[2 * n] += h)
            : 0 !== n
            ? (n !== r && e.bl_tree[2 * n]++, e.bl_tree[32]++)
            : h <= 10
            ? e.bl_tree[34]++
            : e.bl_tree[36]++,
          (h = 0),
          (r = n),
          0 === l
            ? ((o = 138), (d = 3))
            : n === l
            ? ((o = 6), (d = 3))
            : ((o = 7), (d = 4)));
  },
  t6 = (e, a, i) => {
    let s,
      n,
      r = -1,
      l = a[1],
      h = 0,
      o = 7,
      d = 4;
    for (0 === l && ((o = 138), (d = 3)), s = 0; s <= i; s++)
      if (((n = l), (l = a[2 * (s + 1) + 1]), !(++h < o && n === l))) {
        if (h < d)
          do Oo(e, n, e.bl_tree);
          while (0 != --h);
        else
          0 !== n
            ? (n !== r && (Oo(e, n, e.bl_tree), h--),
              Oo(e, 16, e.bl_tree),
              Na(e, h - 3, 2))
            : h <= 10
            ? (Oo(e, 17, e.bl_tree), Na(e, h - 3, 3))
            : (Oo(e, 18, e.bl_tree), Na(e, h - 11, 7));
        (h = 0),
          (r = n),
          0 === l
            ? ((o = 138), (d = 3))
            : n === l
            ? ((o = 6), (d = 3))
            : ((o = 7), (d = 4));
      }
  };
let n6 = !1;
const i6 = (e, a, i, s) => {
  Na(e, 0 + (s ? 1 : 0), 3),
    ZL(e),
    hm(e, i),
    hm(e, ~i),
    i && e.pending_buf.set(e.window.subarray(a, a + i), e.pending),
    (e.pending += i);
};
var Jde = {
    _tr_init(e) {
      n6 ||
        ((() => {
          let e,
            a,
            i,
            s,
            n,
            r = Array(16);
          for (i = 0, s = 0; s < 28; s++)
            for (Nx[s] = i, e = 0; e < 1 << Fx[s]; e++) um[i++] = s;
          for (um[i - 1] = s, n = 0, s = 0; s < 16; s++)
            for (kv[s] = n, e = 0; e < 1 << Dv[s]; e++) dm[n++] = s;
          for (n >>= 7; s < 30; s++)
            for (kv[s] = n << 7, e = 0; e < 1 << (Dv[s] - 7); e++)
              dm[256 + n++] = s;
          for (a = 0; a <= 15; a++) r[a] = 0;
          for (e = 0; e <= 143; ) (Cl[2 * e + 1] = 8), e++, r[8]++;
          for (; e <= 255; ) (Cl[2 * e + 1] = 9), e++, r[9]++;
          for (; e <= 279; ) (Cl[2 * e + 1] = 7), e++, r[7]++;
          for (; e <= 287; ) (Cl[2 * e + 1] = 8), e++, r[8]++;
          for (YL(Cl, 287, r), e = 0; e < 30; e++)
            (cm[2 * e + 1] = 5), (cm[2 * e] = qL(e, 5));
          ($L = new Lx(Cl, Fx, 257, 286, 15)),
            (zL = new Lx(cm, Dv, 0, 30, 15)),
            (WL = new Lx([], Fde, 0, 19, 7));
        })(),
        (n6 = !0)),
        (e.l_desc = new Bx(e.dyn_ltree, $L)),
        (e.d_desc = new Bx(e.dyn_dtree, zL)),
        (e.bl_desc = new Bx(e.bl_tree, WL)),
        (e.bi_buf = 0),
        (e.bi_valid = 0),
        QL(e);
    },
    _tr_stored_block: i6,
    _tr_flush_block(e, a, i, s) {
      let n,
        r,
        l = 0;
      e.level > 0
        ? (2 === e.strm.data_type &&
            (e.strm.data_type = ((e) => {
              let a,
                i = 4093624447;
              for (a = 0; a <= 31; a++, i >>>= 1)
                if (1 & i && 0 !== e.dyn_ltree[2 * a]) return 0;
              if (
                0 !== e.dyn_ltree[18] ||
                0 !== e.dyn_ltree[20] ||
                0 !== e.dyn_ltree[26]
              )
                return 1;
              for (a = 32; a < 256; a++) if (0 !== e.dyn_ltree[2 * a]) return 1;
              return 0;
            })(e)),
          Vx(e, e.l_desc),
          Vx(e, e.d_desc),
          (l = ((e) => {
            let a;
            for (
              e6(e, e.dyn_ltree, e.l_desc.max_code),
                e6(e, e.dyn_dtree, e.d_desc.max_code),
                Vx(e, e.bl_desc),
                a = 18;
              a >= 3 && 0 === e.bl_tree[2 * jL[a] + 1];
              a--
            );
            return (e.opt_len += 3 * (a + 1) + 5 + 5 + 4), a;
          })(e)),
          (n = (e.opt_len + 3 + 7) >>> 3),
          (r = (e.static_len + 3 + 7) >>> 3) <= n && (n = r))
        : (n = r = i + 5),
        i + 4 <= n && -1 !== a
          ? i6(e, a, i, s)
          : 4 === e.strategy || r === n
          ? (Na(e, 2 + (s ? 1 : 0), 3), XL(e, Cl, cm))
          : (Na(e, 4 + (s ? 1 : 0), 3),
            ((e, a, i, s) => {
              let n;
              for (
                Na(e, a - 257, 5), Na(e, i - 1, 5), Na(e, s - 4, 4), n = 0;
                n < s;
                n++
              )
                Na(e, e.bl_tree[2 * jL[n] + 1], 3);
              t6(e, e.dyn_ltree, a - 1), t6(e, e.dyn_dtree, i - 1);
            })(e, e.l_desc.max_code + 1, e.d_desc.max_code + 1, l + 1),
            XL(e, e.dyn_ltree, e.dyn_dtree)),
        QL(e),
        s && ZL(e);
    },
    _tr_tally: (e, a, i) => (
      (e.pending_buf[e.sym_buf + e.sym_next++] = a),
      (e.pending_buf[e.sym_buf + e.sym_next++] = a >> 8),
      (e.pending_buf[e.sym_buf + e.sym_next++] = i),
      0 === a
        ? e.dyn_ltree[2 * i]++
        : (e.matches++,
          a--,
          e.dyn_ltree[2 * (um[i] + 256 + 1)]++,
          e.dyn_dtree[2 * KL(a)]++),
      e.sym_next === e.sym_end
    ),
    _tr_align(e) {
      var a;
      Na(e, 2, 3),
        Oo(e, 256, Cl),
        16 === (a = e).bi_valid
          ? (hm(a, a.bi_buf), (a.bi_buf = 0), (a.bi_valid = 0))
          : a.bi_valid >= 8 &&
            ((a.pending_buf[a.pending++] = 255 & a.bi_buf),
            (a.bi_buf >>= 8),
            (a.bi_valid -= 8));
    },
  },
  fm = (e, a, i, s) => {
    let n = (65535 & e) | 0,
      r = ((e >>> 16) & 65535) | 0,
      l = 0;
    for (; 0 !== i; ) {
      (l = i > 2e3 ? 2e3 : i), (i -= l);
      do r = (r + (n = (n + a[s++]) | 0)) | 0;
      while (--l);
      (n %= 65521), (r %= 65521);
    }
    return n | (r << 16) | 0;
  };
const eue = new Uint32Array(
  (() => {
    let e,
      a = [];
    for (var i = 0; i < 256; i++) {
      e = i;
      for (var s = 0; s < 8; s++) e = 1 & e ? 3988292384 ^ (e >>> 1) : e >>> 1;
      a[i] = e;
    }
    return a;
  })()
);
var Fr = (e, a, i, s) => {
    let n = eue,
      r = s + i;
    e ^= -1;
    for (let l = s; l < r; l++) e = (e >>> 8) ^ n[255 & (e ^ a[l])];
    return -1 ^ e;
  },
  Td = {
    2: "need dictionary",
    1: "stream end",
    0: "",
    "-1": "file error",
    "-2": "stream error",
    "-3": "data error",
    "-4": "insufficient memory",
    "-5": "buffer error",
    "-6": "incompatible version",
  },
  Dd = {
    Z_NO_FLUSH: 0,
    Z_PARTIAL_FLUSH: 1,
    Z_SYNC_FLUSH: 2,
    Z_FULL_FLUSH: 3,
    Z_FINISH: 4,
    Z_BLOCK: 5,
    Z_TREES: 6,
    Z_OK: 0,
    Z_STREAM_END: 1,
    Z_NEED_DICT: 2,
    Z_ERRNO: -1,
    Z_STREAM_ERROR: -2,
    Z_DATA_ERROR: -3,
    Z_MEM_ERROR: -4,
    Z_BUF_ERROR: -5,
    Z_NO_COMPRESSION: 0,
    Z_BEST_SPEED: 1,
    Z_BEST_COMPRESSION: 9,
    Z_DEFAULT_COMPRESSION: -1,
    Z_FILTERED: 1,
    Z_HUFFMAN_ONLY: 2,
    Z_RLE: 3,
    Z_FIXED: 4,
    Z_DEFAULT_STRATEGY: 0,
    Z_BINARY: 0,
    Z_TEXT: 1,
    Z_UNKNOWN: 2,
    Z_DEFLATED: 8,
  };
const {
    _tr_init: tue,
    _tr_stored_block: Ux,
    _tr_flush_block: nue,
    _tr_tally: mc,
    _tr_align: iue,
  } = Jde,
  {
    Z_NO_FLUSH: gc,
    Z_PARTIAL_FLUSH: rue,
    Z_FULL_FLUSH: aue,
    Z_FINISH: Ds,
    Z_BLOCK: r6,
    Z_OK: jr,
    Z_STREAM_END: a6,
    Z_STREAM_ERROR: Ro,
    Z_DATA_ERROR: sue,
    Z_BUF_ERROR: Gx,
    Z_DEFAULT_COMPRESSION: oue,
    Z_FILTERED: lue,
    Z_HUFFMAN_ONLY: Iv,
    Z_RLE: cue,
    Z_FIXED: due,
    Z_DEFAULT_STRATEGY: uue,
    Z_UNKNOWN: hue,
    Z_DEFLATED: Mv,
  } = Dd,
  Po = 262,
  Md = (e, a) => ((e.msg = Td[a]), a),
  s6 = (e) => 2 * e - (e > 4 ? 9 : 0),
  vc = (e) => {
    let a = e.length;
    for (; --a >= 0; ) e[a] = 0;
  },
  Sue = (e) => {
    let a,
      i,
      s,
      n = e.w_size;
    s = a = e.hash_size;
    do (i = e.head[--s]), (e.head[s] = i >= n ? i - n : 0);
    while (--a);
    s = a = n;
    do (i = e.prev[--s]), (e.prev[s] = i >= n ? i - n : 0);
    while (--a);
  };
let bc = (e, a, i) => ((a << e.hash_shift) ^ i) & e.hash_mask;
const as = (e) => {
    let a = e.state,
      i = a.pending;
    i > e.avail_out && (i = e.avail_out),
      0 !== i &&
        (e.output.set(
          a.pending_buf.subarray(a.pending_out, a.pending_out + i),
          e.next_out
        ),
        (e.next_out += i),
        (a.pending_out += i),
        (e.total_out += i),
        (e.avail_out -= i),
        (a.pending -= i),
        0 === a.pending && (a.pending_out = 0));
  },
  ss = (e, a) => {
    nue(
      e,
      e.block_start >= 0 ? e.block_start : -1,
      e.strstart - e.block_start,
      a
    ),
      (e.block_start = e.strstart),
      as(e.strm);
  },
  Hn = (e, a) => {
    e.pending_buf[e.pending++] = a;
  },
  mm = (e, a) => {
    (e.pending_buf[e.pending++] = (a >>> 8) & 255),
      (e.pending_buf[e.pending++] = 255 & a);
  },
  Yx = (e, a, i, s) => {
    let n = e.avail_in;
    return (
      n > s && (n = s),
      0 === n
        ? 0
        : ((e.avail_in -= n),
          a.set(e.input.subarray(e.next_in, e.next_in + n), i),
          1 === e.state.wrap
            ? (e.adler = fm(e.adler, a, n, i))
            : 2 === e.state.wrap && (e.adler = Fr(e.adler, a, n, i)),
          (e.next_in += n),
          (e.total_in += n),
          n)
    );
  },
  o6 = (e, a) => {
    let i,
      s,
      n = e.max_chain_length,
      r = e.strstart,
      l = e.prev_length,
      h = e.nice_match,
      o = e.strstart > e.w_size - 262 ? e.strstart - (e.w_size - 262) : 0,
      d = e.window,
      _ = e.w_mask,
      $ = e.prev,
      u = e.strstart + 258,
      f = d[r + l - 1],
      c = d[r + l];
    e.prev_length >= e.good_match && (n >>= 2),
      h > e.lookahead && (h = e.lookahead);
    do
      if (
        d[(i = a) + l] === c &&
        d[i + l - 1] === f &&
        d[i] === d[r] &&
        d[++i] === d[r + 1]
      ) {
        (r += 2), i++;
        do;
        while (
          d[++r] === d[++i] &&
          d[++r] === d[++i] &&
          d[++r] === d[++i] &&
          d[++r] === d[++i] &&
          d[++r] === d[++i] &&
          d[++r] === d[++i] &&
          d[++r] === d[++i] &&
          d[++r] === d[++i] &&
          r < u
        );
        if (((s = 258 - (u - r)), (r = u - 258), s > l)) {
          if (((e.match_start = a), (l = s), s >= h)) break;
          (f = d[r + l - 1]), (c = d[r + l]);
        }
      }
    while ((a = $[a & _]) > o && 0 != --n);
    return l <= e.lookahead ? l : e.lookahead;
  },
  Rh = (e) => {
    let a = e.w_size,
      i,
      s,
      n;
    do {
      if (
        ((s = e.window_size - e.lookahead - e.strstart),
        e.strstart >= a + (a - 262) &&
          (e.window.set(e.window.subarray(a, a + a - s), 0),
          (e.match_start -= a),
          (e.strstart -= a),
          (e.block_start -= a),
          e.insert > e.strstart && (e.insert = e.strstart),
          Sue(e),
          (s += a)),
        0 === e.strm.avail_in)
      )
        break;
      if (
        ((i = Yx(e.strm, e.window, e.strstart + e.lookahead, s)),
        (e.lookahead += i),
        e.lookahead + e.insert >= 3)
      )
        for (
          n = e.strstart - e.insert,
            e.ins_h = e.window[n],
            e.ins_h = bc(e, e.ins_h, e.window[n + 1]);
          e.insert &&
          ((e.ins_h = bc(e, e.ins_h, e.window[n + 3 - 1])),
          (e.prev[n & e.w_mask] = e.head[e.ins_h]),
          (e.head[e.ins_h] = n),
          n++,
          e.insert--,
          !(e.lookahead + e.insert < 3));

        );
    } while (e.lookahead < 262 && 0 !== e.strm.avail_in);
  },
  l6 = (e, a) => {
    let i,
      s,
      n,
      r = e.pending_buf_size - 5 > e.w_size ? e.w_size : e.pending_buf_size - 5,
      l = 0,
      h = e.strm.avail_in;
    do {
      if (
        ((i = 65535),
        (n = (e.bi_valid + 42) >> 3),
        e.strm.avail_out < n ||
          ((n = e.strm.avail_out - n),
          i > (s = e.strstart - e.block_start) + e.strm.avail_in &&
            (i = s + e.strm.avail_in),
          i > n && (i = n),
          i < r &&
            ((0 === i && a !== Ds) || a === gc || i !== s + e.strm.avail_in)))
      )
        break;
      (l = a === Ds && i === s + e.strm.avail_in ? 1 : 0),
        Ux(e, 0, 0, l),
        (e.pending_buf[e.pending - 4] = i),
        (e.pending_buf[e.pending - 3] = i >> 8),
        (e.pending_buf[e.pending - 2] = ~i),
        (e.pending_buf[e.pending - 1] = ~i >> 8),
        as(e.strm),
        s &&
          (s > i && (s = i),
          e.strm.output.set(
            e.window.subarray(e.block_start, e.block_start + s),
            e.strm.next_out
          ),
          (e.strm.next_out += s),
          (e.strm.avail_out -= s),
          (e.strm.total_out += s),
          (e.block_start += s),
          (i -= s)),
        i &&
          (Yx(e.strm, e.strm.output, e.strm.next_out, i),
          (e.strm.next_out += i),
          (e.strm.avail_out -= i),
          (e.strm.total_out += i));
    } while (0 === l);
    return (
      (h -= e.strm.avail_in) &&
        (h >= e.w_size
          ? ((e.matches = 2),
            e.window.set(
              e.strm.input.subarray(e.strm.next_in - e.w_size, e.strm.next_in),
              0
            ),
            (e.strstart = e.w_size),
            (e.insert = e.strstart))
          : (e.window_size - e.strstart <= h &&
              ((e.strstart -= e.w_size),
              e.window.set(
                e.window.subarray(e.w_size, e.w_size + e.strstart),
                0
              ),
              e.matches < 2 && e.matches++,
              e.insert > e.strstart && (e.insert = e.strstart)),
            e.window.set(
              e.strm.input.subarray(e.strm.next_in - h, e.strm.next_in),
              e.strstart
            ),
            (e.strstart += h),
            (e.insert += h > e.w_size - e.insert ? e.w_size - e.insert : h)),
        (e.block_start = e.strstart)),
      e.high_water < e.strstart && (e.high_water = e.strstart),
      l
        ? 4
        : a !== gc &&
          a !== Ds &&
          0 === e.strm.avail_in &&
          e.strstart === e.block_start
        ? 2
        : ((n = e.window_size - e.strstart),
          e.strm.avail_in > n &&
            e.block_start >= e.w_size &&
            ((e.block_start -= e.w_size),
            (e.strstart -= e.w_size),
            e.window.set(e.window.subarray(e.w_size, e.w_size + e.strstart), 0),
            e.matches < 2 && e.matches++,
            (n += e.w_size),
            e.insert > e.strstart && (e.insert = e.strstart)),
          n > e.strm.avail_in && (n = e.strm.avail_in),
          n &&
            (Yx(e.strm, e.window, e.strstart, n),
            (e.strstart += n),
            (e.insert += n > e.w_size - e.insert ? e.w_size - e.insert : n)),
          e.high_water < e.strstart && (e.high_water = e.strstart),
          (n = (e.bi_valid + 42) >> 3),
          (r =
            (n =
              e.pending_buf_size - n > 65535 ? 65535 : e.pending_buf_size - n) >
            e.w_size
              ? e.w_size
              : n),
          ((s = e.strstart - e.block_start) >= r ||
            ((s || a === Ds) && a !== gc && 0 === e.strm.avail_in && s <= n)) &&
            ((i = s > n ? n : s),
            (l = a === Ds && 0 === e.strm.avail_in && i === s ? 1 : 0),
            Ux(e, e.block_start, i, l),
            (e.block_start += i),
            as(e.strm)),
          l ? 3 : 1)
    );
  },
  Qx = (e, a) => {
    let i, s;
    for (;;) {
      if (e.lookahead < 262) {
        if ((Rh(e), e.lookahead < 262 && a === gc)) return 1;
        if (0 === e.lookahead) break;
      }
      if (
        ((i = 0),
        e.lookahead >= 3 &&
          ((e.ins_h = bc(e, e.ins_h, e.window[e.strstart + 3 - 1])),
          (i = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h]),
          (e.head[e.ins_h] = e.strstart)),
        0 !== i &&
          e.strstart - i <= e.w_size - 262 &&
          (e.match_length = o6(e, i)),
        e.match_length >= 3)
      ) {
        if (
          ((s = mc(e, e.strstart - e.match_start, e.match_length - 3)),
          (e.lookahead -= e.match_length),
          e.match_length <= e.max_lazy_match && e.lookahead >= 3)
        ) {
          e.match_length--;
          do
            e.strstart++,
              (e.ins_h = bc(e, e.ins_h, e.window[e.strstart + 3 - 1])),
              (i = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h]),
              (e.head[e.ins_h] = e.strstart);
          while (0 != --e.match_length);
          e.strstart++;
        } else
          (e.strstart += e.match_length),
            (e.match_length = 0),
            (e.ins_h = e.window[e.strstart]),
            (e.ins_h = bc(e, e.ins_h, e.window[e.strstart + 1]));
      } else (s = mc(e, 0, e.window[e.strstart])), e.lookahead--, e.strstart++;
      if (s && (ss(e, !1), 0 === e.strm.avail_out)) return 1;
    }
    return (
      (e.insert = e.strstart < 2 ? e.strstart : 2),
      a === Ds
        ? (ss(e, !0), 0 === e.strm.avail_out ? 3 : 4)
        : e.sym_next && (ss(e, !1), 0 === e.strm.avail_out)
        ? 1
        : 2
    );
  },
  Ph = (e, a) => {
    let i, s, n;
    for (;;) {
      if (e.lookahead < 262) {
        if ((Rh(e), e.lookahead < 262 && a === gc)) return 1;
        if (0 === e.lookahead) break;
      }
      if (
        ((i = 0),
        e.lookahead >= 3 &&
          ((e.ins_h = bc(e, e.ins_h, e.window[e.strstart + 3 - 1])),
          (i = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h]),
          (e.head[e.ins_h] = e.strstart)),
        (e.prev_length = e.match_length),
        (e.prev_match = e.match_start),
        (e.match_length = 2),
        0 !== i &&
          e.prev_length < e.max_lazy_match &&
          e.strstart - i <= e.w_size - 262 &&
          ((e.match_length = o6(e, i)),
          e.match_length <= 5 &&
            (e.strategy === lue ||
              (3 === e.match_length && e.strstart - e.match_start > 4096)) &&
            (e.match_length = 2)),
        e.prev_length >= 3 && e.match_length <= e.prev_length)
      ) {
        (n = e.strstart + e.lookahead - 3),
          (s = mc(e, e.strstart - 1 - e.prev_match, e.prev_length - 3)),
          (e.lookahead -= e.prev_length - 1),
          (e.prev_length -= 2);
        do
          ++e.strstart <= n &&
            ((e.ins_h = bc(e, e.ins_h, e.window[e.strstart + 3 - 1])),
            (i = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h]),
            (e.head[e.ins_h] = e.strstart));
        while (0 != --e.prev_length);
        if (
          ((e.match_available = 0),
          (e.match_length = 2),
          e.strstart++,
          s && (ss(e, !1), 0 === e.strm.avail_out))
        )
          return 1;
      } else if (e.match_available) {
        if (
          ((s = mc(e, 0, e.window[e.strstart - 1])) && ss(e, !1),
          e.strstart++,
          e.lookahead--,
          0 === e.strm.avail_out)
        )
          return 1;
      } else (e.match_available = 1), e.strstart++, e.lookahead--;
    }
    return (
      e.match_available &&
        ((s = mc(e, 0, e.window[e.strstart - 1])), (e.match_available = 0)),
      (e.insert = e.strstart < 2 ? e.strstart : 2),
      a === Ds
        ? (ss(e, !0), 0 === e.strm.avail_out ? 3 : 4)
        : e.sym_next && (ss(e, !1), 0 === e.strm.avail_out)
        ? 1
        : 2
    );
  };
function Fo(e, a, i, s, n) {
  (this.good_length = e),
    (this.max_lazy = a),
    (this.nice_length = i),
    (this.max_chain = s),
    (this.func = n);
}
const gm = [
  new Fo(0, 0, 0, 0, l6),
  new Fo(4, 4, 8, 4, Qx),
  new Fo(4, 5, 16, 8, Qx),
  new Fo(4, 6, 32, 32, Qx),
  new Fo(4, 4, 16, 16, Ph),
  new Fo(8, 16, 32, 32, Ph),
  new Fo(8, 16, 128, 128, Ph),
  new Fo(8, 32, 128, 256, Ph),
  new Fo(32, 128, 258, 1024, Ph),
  new Fo(32, 258, 258, 4096, Ph),
];
function kue() {
  (this.strm = null),
    (this.status = 0),
    (this.pending_buf = null),
    (this.pending_buf_size = 0),
    (this.pending_out = 0),
    (this.pending = 0),
    (this.wrap = 0),
    (this.gzhead = null),
    (this.gzindex = 0),
    (this.method = Mv),
    (this.last_flush = -1),
    (this.w_size = 0),
    (this.w_bits = 0),
    (this.w_mask = 0),
    (this.window = null),
    (this.window_size = 0),
    (this.prev = null),
    (this.head = null),
    (this.ins_h = 0),
    (this.hash_size = 0),
    (this.hash_bits = 0),
    (this.hash_mask = 0),
    (this.hash_shift = 0),
    (this.block_start = 0),
    (this.match_length = 0),
    (this.prev_match = 0),
    (this.match_available = 0),
    (this.strstart = 0),
    (this.match_start = 0),
    (this.lookahead = 0),
    (this.prev_length = 0),
    (this.max_chain_length = 0),
    (this.max_lazy_match = 0),
    (this.level = 0),
    (this.strategy = 0),
    (this.good_match = 0),
    (this.nice_match = 0),
    (this.dyn_ltree = new Uint16Array(1146)),
    (this.dyn_dtree = new Uint16Array(122)),
    (this.bl_tree = new Uint16Array(78)),
    vc(this.dyn_ltree),
    vc(this.dyn_dtree),
    vc(this.bl_tree),
    (this.l_desc = null),
    (this.d_desc = null),
    (this.bl_desc = null),
    (this.bl_count = new Uint16Array(16)),
    (this.heap = new Uint16Array(573)),
    vc(this.heap),
    (this.heap_len = 0),
    (this.heap_max = 0),
    (this.depth = new Uint16Array(573)),
    vc(this.depth),
    (this.sym_buf = 0),
    (this.lit_bufsize = 0),
    (this.sym_next = 0),
    (this.sym_end = 0),
    (this.opt_len = 0),
    (this.static_len = 0),
    (this.matches = 0),
    (this.insert = 0),
    (this.bi_buf = 0),
    (this.bi_valid = 0);
}
const _m = (e) => {
    if (!e) return 1;
    let a = e.state;
    return a &&
      a.strm === e &&
      (42 === a.status ||
        57 === a.status ||
        69 === a.status ||
        73 === a.status ||
        91 === a.status ||
        103 === a.status ||
        113 === a.status ||
        666 === a.status)
      ? 0
      : 1;
  },
  c6 = (e) => {
    if (_m(e)) return Md(e, Ro);
    (e.total_in = e.total_out = 0), (e.data_type = hue);
    let a = e.state;
    return (
      (a.pending = 0),
      (a.pending_out = 0),
      a.wrap < 0 && (a.wrap = -a.wrap),
      (a.status = 2 === a.wrap ? 57 : a.wrap ? 42 : 113),
      (e.adler = 2 === a.wrap ? 0 : 1),
      (a.last_flush = -2),
      tue(a),
      jr
    );
  },
  d6 = (e) => {
    let a = c6(e);
    return (
      a === jr &&
        ((e) => {
          (e.window_size = 2 * e.w_size),
            vc(e.head),
            (e.max_lazy_match = gm[e.level].max_lazy),
            (e.good_match = gm[e.level].good_length),
            (e.nice_match = gm[e.level].nice_length),
            (e.max_chain_length = gm[e.level].max_chain),
            (e.strstart = 0),
            (e.block_start = 0),
            (e.lookahead = 0),
            (e.insert = 0),
            (e.match_length = e.prev_length = 2),
            (e.match_available = 0),
            (e.ins_h = 0);
        })(e.state),
      a
    );
  },
  u6 = (e, a, i, s, n, r) => {
    if (!e) return Ro;
    let l = 1;
    if (
      (a === oue && (a = 6),
      s < 0 ? ((l = 0), (s = -s)) : s > 15 && ((l = 2), (s -= 16)),
      n < 1 ||
        n > 9 ||
        i !== Mv ||
        s < 8 ||
        s > 15 ||
        a < 0 ||
        a > 9 ||
        r < 0 ||
        r > due ||
        (8 === s && 1 !== l))
    )
      return Md(e, Ro);
    8 === s && (s = 9);
    let h = new kue();
    return (
      (e.state = h),
      (h.strm = e),
      (h.status = 42),
      (h.wrap = l),
      (h.gzhead = null),
      (h.w_bits = s),
      (h.w_size = 1 << h.w_bits),
      (h.w_mask = h.w_size - 1),
      (h.hash_bits = n + 7),
      (h.hash_size = 1 << h.hash_bits),
      (h.hash_mask = h.hash_size - 1),
      (h.hash_shift = ~~((h.hash_bits + 3 - 1) / 3)),
      (h.window = new Uint8Array(2 * h.w_size)),
      (h.head = new Uint16Array(h.hash_size)),
      (h.prev = new Uint16Array(h.w_size)),
      (h.lit_bufsize = 1 << (n + 6)),
      (h.pending_buf_size = 4 * h.lit_bufsize),
      (h.pending_buf = new Uint8Array(h.pending_buf_size)),
      (h.sym_buf = h.lit_bufsize),
      (h.sym_end = 3 * (h.lit_bufsize - 1)),
      (h.level = a),
      (h.strategy = r),
      (h.method = i),
      d6(e)
    );
  };
var vm_deflateInit2 = u6,
  vm_deflateSetHeader = (e, a) =>
    _m(e) || 2 !== e.state.wrap ? Ro : ((e.state.gzhead = a), jr),
  vm_deflate = (e, a) => {
    if (_m(e) || a > r6 || a < 0) return e ? Md(e, Ro) : Ro;
    let i = e.state;
    if (
      !e.output ||
      (0 !== e.avail_in && !e.input) ||
      (666 === i.status && a !== Ds)
    )
      return Md(e, 0 === e.avail_out ? Gx : Ro);
    let s = i.last_flush;
    if (((i.last_flush = a), 0 !== i.pending)) {
      if ((as(e), 0 === e.avail_out)) return (i.last_flush = -1), jr;
    } else if (0 === e.avail_in && s6(a) <= s6(s) && a !== Ds) return Md(e, Gx);
    if (666 === i.status && 0 !== e.avail_in) return Md(e, Gx);
    if (
      (42 === i.status && 0 === i.wrap && (i.status = 113), 42 === i.status)
    ) {
      let n = (Mv + ((i.w_bits - 8) << 4)) << 8,
        r = -1;
      if (
        ((n |=
          (r =
            i.strategy >= Iv || i.level < 2
              ? 0
              : i.level < 6
              ? 1
              : 6 === i.level
              ? 2
              : 3) << 6),
        0 !== i.strstart && (n |= 32),
        mm(i, (n += 31 - (n % 31))),
        0 !== i.strstart && (mm(i, e.adler >>> 16), mm(i, 65535 & e.adler)),
        (e.adler = 1),
        (i.status = 113),
        as(e),
        0 !== i.pending)
      )
        return (i.last_flush = -1), jr;
    }
    if (57 === i.status) {
      if (((e.adler = 0), Hn(i, 31), Hn(i, 139), Hn(i, 8), i.gzhead))
        Hn(
          i,
          (i.gzhead.text ? 1 : 0) +
            (i.gzhead.hcrc ? 2 : 0) +
            (i.gzhead.extra ? 4 : 0) +
            (i.gzhead.name ? 8 : 0) +
            (i.gzhead.comment ? 16 : 0)
        ),
          Hn(i, 255 & i.gzhead.time),
          Hn(i, (i.gzhead.time >> 8) & 255),
          Hn(i, (i.gzhead.time >> 16) & 255),
          Hn(i, (i.gzhead.time >> 24) & 255),
          Hn(i, 9 === i.level ? 2 : i.strategy >= Iv || i.level < 2 ? 4 : 0),
          Hn(i, 255 & i.gzhead.os),
          i.gzhead.extra &&
            i.gzhead.extra.length &&
            (Hn(i, 255 & i.gzhead.extra.length),
            Hn(i, (i.gzhead.extra.length >> 8) & 255)),
          i.gzhead.hcrc && (e.adler = Fr(e.adler, i.pending_buf, i.pending, 0)),
          (i.gzindex = 0),
          (i.status = 69);
      else if (
        (Hn(i, 0),
        Hn(i, 0),
        Hn(i, 0),
        Hn(i, 0),
        Hn(i, 0),
        Hn(i, 9 === i.level ? 2 : i.strategy >= Iv || i.level < 2 ? 4 : 0),
        Hn(i, 3),
        (i.status = 113),
        as(e),
        0 !== i.pending)
      )
        return (i.last_flush = -1), jr;
    }
    if (69 === i.status) {
      if (i.gzhead.extra) {
        let l = i.pending,
          h = (65535 & i.gzhead.extra.length) - i.gzindex;
        for (; i.pending + h > i.pending_buf_size; ) {
          let o = i.pending_buf_size - i.pending;
          if (
            (i.pending_buf.set(
              i.gzhead.extra.subarray(i.gzindex, i.gzindex + o),
              i.pending
            ),
            (i.pending = i.pending_buf_size),
            i.gzhead.hcrc &&
              i.pending > l &&
              (e.adler = Fr(e.adler, i.pending_buf, i.pending - l, l)),
            (i.gzindex += o),
            as(e),
            0 !== i.pending)
          )
            return (i.last_flush = -1), jr;
          (l = 0), (h -= o);
        }
        let d = new Uint8Array(i.gzhead.extra);
        i.pending_buf.set(d.subarray(i.gzindex, i.gzindex + h), i.pending),
          (i.pending += h),
          i.gzhead.hcrc &&
            i.pending > l &&
            (e.adler = Fr(e.adler, i.pending_buf, i.pending - l, l)),
          (i.gzindex = 0);
      }
      i.status = 73;
    }
    if (73 === i.status) {
      if (i.gzhead.name) {
        let _,
          $ = i.pending;
        do {
          if (i.pending === i.pending_buf_size) {
            if (
              (i.gzhead.hcrc &&
                i.pending > $ &&
                (e.adler = Fr(e.adler, i.pending_buf, i.pending - $, $)),
              as(e),
              0 !== i.pending)
            )
              return (i.last_flush = -1), jr;
            $ = 0;
          }
          (_ =
            i.gzindex < i.gzhead.name.length
              ? 255 & i.gzhead.name.charCodeAt(i.gzindex++)
              : 0),
            Hn(i, _);
        } while (0 !== _);
        i.gzhead.hcrc &&
          i.pending > $ &&
          (e.adler = Fr(e.adler, i.pending_buf, i.pending - $, $)),
          (i.gzindex = 0);
      }
      i.status = 91;
    }
    if (91 === i.status) {
      if (i.gzhead.comment) {
        let u,
          f = i.pending;
        do {
          if (i.pending === i.pending_buf_size) {
            if (
              (i.gzhead.hcrc &&
                i.pending > f &&
                (e.adler = Fr(e.adler, i.pending_buf, i.pending - f, f)),
              as(e),
              0 !== i.pending)
            )
              return (i.last_flush = -1), jr;
            f = 0;
          }
          (u =
            i.gzindex < i.gzhead.comment.length
              ? 255 & i.gzhead.comment.charCodeAt(i.gzindex++)
              : 0),
            Hn(i, u);
        } while (0 !== u);
        i.gzhead.hcrc &&
          i.pending > f &&
          (e.adler = Fr(e.adler, i.pending_buf, i.pending - f, f));
      }
      i.status = 103;
    }
    if (103 === i.status) {
      if (i.gzhead.hcrc) {
        if (i.pending + 2 > i.pending_buf_size && (as(e), 0 !== i.pending))
          return (i.last_flush = -1), jr;
        Hn(i, 255 & e.adler), Hn(i, (e.adler >> 8) & 255), (e.adler = 0);
      }
      if (((i.status = 113), as(e), 0 !== i.pending))
        return (i.last_flush = -1), jr;
    }
    if (
      0 !== e.avail_in ||
      0 !== i.lookahead ||
      (a !== gc && 666 !== i.status)
    ) {
      let c =
        0 === i.level
          ? l6(i, a)
          : i.strategy === Iv
          ? ((e, a) => {
              let i;
              for (;;) {
                if (0 === e.lookahead && (Rh(e), 0 === e.lookahead)) {
                  if (a === gc) return 1;
                  break;
                }
                if (
                  ((e.match_length = 0),
                  (i = mc(e, 0, e.window[e.strstart])),
                  e.lookahead--,
                  e.strstart++,
                  i && (ss(e, !1), 0 === e.strm.avail_out))
                )
                  return 1;
              }
              return (
                (e.insert = 0),
                a === Ds
                  ? (ss(e, !0), 0 === e.strm.avail_out ? 3 : 4)
                  : e.sym_next && (ss(e, !1), 0 === e.strm.avail_out)
                  ? 1
                  : 2
              );
            })(i, a)
          : i.strategy === cue
          ? ((e, a) => {
              let i,
                s,
                n,
                r,
                l = e.window;
              for (;;) {
                if (e.lookahead <= 258) {
                  if ((Rh(e), e.lookahead <= 258 && a === gc)) return 1;
                  if (0 === e.lookahead) break;
                }
                if (
                  ((e.match_length = 0),
                  e.lookahead >= 3 &&
                    e.strstart > 0 &&
                    (s = l[(n = e.strstart - 1)]) === l[++n] &&
                    s === l[++n] &&
                    s === l[++n])
                ) {
                  r = e.strstart + 258;
                  do;
                  while (
                    s === l[++n] &&
                    s === l[++n] &&
                    s === l[++n] &&
                    s === l[++n] &&
                    s === l[++n] &&
                    s === l[++n] &&
                    s === l[++n] &&
                    s === l[++n] &&
                    n < r
                  );
                  (e.match_length = 258 - (r - n)),
                    e.match_length > e.lookahead &&
                      (e.match_length = e.lookahead);
                }
                if (
                  (e.match_length >= 3
                    ? ((i = mc(e, 1, e.match_length - 3)),
                      (e.lookahead -= e.match_length),
                      (e.strstart += e.match_length),
                      (e.match_length = 0))
                    : ((i = mc(e, 0, e.window[e.strstart])),
                      e.lookahead--,
                      e.strstart++),
                  i && (ss(e, !1), 0 === e.strm.avail_out))
                )
                  return 1;
              }
              return (
                (e.insert = 0),
                a === Ds
                  ? (ss(e, !0), 0 === e.strm.avail_out ? 3 : 4)
                  : e.sym_next && (ss(e, !1), 0 === e.strm.avail_out)
                  ? 1
                  : 2
              );
            })(i, a)
          : gm[i.level].func(i, a);
      if (((3 === c || 4 === c) && (i.status = 666), 1 === c || 3 === c))
        return 0 === e.avail_out && (i.last_flush = -1), jr;
      if (
        2 === c &&
        (a === rue
          ? iue(i)
          : a !== r6 &&
            (Ux(i, 0, 0, !1),
            a === aue &&
              (vc(i.head),
              0 === i.lookahead &&
                ((i.strstart = 0), (i.block_start = 0), (i.insert = 0)))),
        as(e),
        0 === e.avail_out)
      )
        return (i.last_flush = -1), jr;
    }
    return a !== Ds
      ? jr
      : i.wrap <= 0
      ? a6
      : (2 === i.wrap
          ? (Hn(i, 255 & e.adler),
            Hn(i, (e.adler >> 8) & 255),
            Hn(i, (e.adler >> 16) & 255),
            Hn(i, (e.adler >> 24) & 255),
            Hn(i, 255 & e.total_in),
            Hn(i, (e.total_in >> 8) & 255),
            Hn(i, (e.total_in >> 16) & 255),
            Hn(i, (e.total_in >> 24) & 255))
          : (mm(i, e.adler >>> 16), mm(i, 65535 & e.adler)),
        as(e),
        i.wrap > 0 && (i.wrap = -i.wrap),
        0 !== i.pending ? jr : a6);
  },
  vm_deflateEnd = (e) => {
    if (_m(e)) return Ro;
    let a = e.state.status;
    return (e.state = null), 113 === a ? Md(e, sue) : jr;
  },
  vm_deflateSetDictionary = (e, a) => {
    let i = a.length;
    if (_m(e)) return Ro;
    let s = e.state,
      n = s.wrap;
    if (2 === n || (1 === n && 42 !== s.status) || s.lookahead) return Ro;
    if (
      (1 === n && (e.adler = fm(e.adler, a, i, 0)), (s.wrap = 0), i >= s.w_size)
    ) {
      0 === n &&
        (vc(s.head), (s.strstart = 0), (s.block_start = 0), (s.insert = 0));
      let r = new Uint8Array(s.w_size);
      r.set(a.subarray(i - s.w_size, i), 0), (a = r), (i = s.w_size);
    }
    let l = e.avail_in,
      h = e.next_in,
      o = e.input;
    for (
      e.avail_in = i, e.next_in = 0, e.input = a, Rh(s);
      s.lookahead >= 3;

    ) {
      let d = s.strstart,
        _ = s.lookahead - 2;
      do
        (s.ins_h = bc(s, s.ins_h, s.window[d + 3 - 1])),
          (s.prev[d & s.w_mask] = s.head[s.ins_h]),
          (s.head[s.ins_h] = d),
          d++;
      while (--_);
      (s.strstart = d), (s.lookahead = 2), Rh(s);
    }
    return (
      (s.strstart += s.lookahead),
      (s.block_start = s.strstart),
      (s.insert = s.lookahead),
      (s.lookahead = 0),
      (s.match_length = s.prev_length = 2),
      (s.match_available = 0),
      (e.next_in = h),
      (e.input = o),
      (e.avail_in = l),
      (s.wrap = n),
      jr
    );
  };
const Gue = (e, a) => Object.prototype.hasOwnProperty.call(e, a);
var Ev_assign = function (e) {
    let a = Array.prototype.slice.call(arguments, 1);
    for (; a.length; ) {
      let i = a.shift();
      if (i) {
        if ("object" != typeof i) throw TypeError(i + "must be non-object");
        for (let s in i) Gue(i, s) && (e[s] = i[s]);
      }
    }
    return e;
  },
  Ev_flattenChunks = (e) => {
    let a = 0;
    for (let i = 0, s = e.length; i < s; i++) a += e[i].length;
    let n = new Uint8Array(a);
    for (let r = 0, l = 0, h = e.length; r < h; r++) {
      let o = e[r];
      n.set(o, l), (l += o.length);
    }
    return n;
  };
let h6 = !0;
try {
  String.fromCharCode.apply(null, new Uint8Array(1));
} catch (e) {
  h6 = !1;
}
const bm = new Uint8Array(256);
for (let t = 0; t < 256; t++)
  bm[t] =
    t >= 252
      ? 6
      : t >= 248
      ? 5
      : t >= 240
      ? 4
      : t >= 224
      ? 3
      : t >= 192
      ? 2
      : 1;
bm[254] = bm[254] = 1;
var ym_string2buf = (e) => {
    if ("function" == typeof TextEncoder && TextEncoder.prototype.encode)
      return new TextEncoder().encode(e);
    let a,
      i,
      s,
      n,
      r,
      l = e.length,
      h = 0;
    for (n = 0; n < l; n++)
      55296 == (64512 & (i = e.charCodeAt(n))) &&
        n + 1 < l &&
        56320 == (64512 & (s = e.charCodeAt(n + 1))) &&
        ((i = 65536 + ((i - 55296) << 10) + (s - 56320)), n++),
        (h += i < 128 ? 1 : i < 2048 ? 2 : i < 65536 ? 3 : 4);
    for (a = new Uint8Array(h), r = 0, n = 0; r < h; n++)
      55296 == (64512 & (i = e.charCodeAt(n))) &&
        n + 1 < l &&
        56320 == (64512 & (s = e.charCodeAt(n + 1))) &&
        ((i = 65536 + ((i - 55296) << 10) + (s - 56320)), n++),
        i < 128
          ? (a[r++] = i)
          : i < 2048
          ? ((a[r++] = 192 | (i >>> 6)), (a[r++] = 128 | (63 & i)))
          : i < 65536
          ? ((a[r++] = 224 | (i >>> 12)),
            (a[r++] = 128 | ((i >>> 6) & 63)),
            (a[r++] = 128 | (63 & i)))
          : ((a[r++] = 240 | (i >>> 18)),
            (a[r++] = 128 | ((i >>> 12) & 63)),
            (a[r++] = 128 | ((i >>> 6) & 63)),
            (a[r++] = 128 | (63 & i)));
    return a;
  },
  ym_buf2string = (e, a) => {
    let i = a || e.length;
    if ("function" == typeof TextDecoder && TextDecoder.prototype.decode)
      return new TextDecoder().decode(e.subarray(0, a));
    let s,
      n,
      r = Array(2 * i);
    for (n = 0, s = 0; s < i; ) {
      let l = e[s++];
      if (l < 128) {
        r[n++] = l;
        continue;
      }
      let h = bm[l];
      if (h > 4) (r[n++] = 65533), (s += h - 1);
      else {
        for (l &= 2 === h ? 31 : 3 === h ? 15 : 7; h > 1 && s < i; )
          (l = (l << 6) | (63 & e[s++])), h--;
        h > 1
          ? (r[n++] = 65533)
          : l < 65536
          ? (r[n++] = l)
          : ((l -= 65536),
            (r[n++] = 55296 | ((l >> 10) & 1023)),
            (r[n++] = 56320 | (1023 & l)));
      }
    }
    return ((e, a) => {
      if (a < 65534 && e.subarray && h6)
        return String.fromCharCode.apply(
          null,
          e.length === a ? e : e.subarray(0, a)
        );
      let i = "";
      for (let s = 0; s < a; s++) i += String.fromCharCode(e[s]);
      return i;
    })(r, n);
  },
  ym_utf8border = (e, a) => {
    (a = a || e.length) > e.length && (a = e.length);
    let i = a - 1;
    for (; i >= 0 && 128 == (192 & e[i]); ) i--;
    return i < 0 || 0 === i ? a : i + bm[e[i]] > a ? i : a;
  },
  f6 = function e() {
    (this.input = null),
      (this.next_in = 0),
      (this.avail_in = 0),
      (this.total_in = 0),
      (this.output = null),
      (this.next_out = 0),
      (this.avail_out = 0),
      (this.total_out = 0),
      (this.msg = ""),
      (this.state = null),
      (this.data_type = 2),
      (this.adler = 0);
  };
const p6 = Object.prototype.toString,
  {
    Z_NO_FLUSH: Que,
    Z_SYNC_FLUSH: Zue,
    Z_FULL_FLUSH: Jue,
    Z_FINISH: Xue,
    Z_OK: Av,
    Z_STREAM_END: ehe,
    Z_DEFAULT_COMPRESSION: the,
    Z_DEFAULT_STRATEGY: nhe,
    Z_DEFLATED: ihe,
  } = Dd;
function Cm(e) {
  this.options = Ev_assign(
    {
      level: the,
      method: ihe,
      chunkSize: 16384,
      windowBits: 15,
      memLevel: 8,
      strategy: nhe,
    },
    e || {}
  );
  let a = this.options;
  a.raw && a.windowBits > 0
    ? (a.windowBits = -a.windowBits)
    : a.gzip && a.windowBits > 0 && a.windowBits < 16 && (a.windowBits += 16),
    (this.err = 0),
    (this.msg = ""),
    (this.ended = !1),
    (this.chunks = []),
    (this.strm = new f6()),
    (this.strm.avail_out = 0);
  let i = vm_deflateInit2(
    this.strm,
    a.level,
    a.method,
    a.windowBits,
    a.memLevel,
    a.strategy
  );
  if (i !== Av) throw Error(Td[i]);
  if ((a.header && vm_deflateSetHeader(this.strm, a.header), a.dictionary)) {
    let s;
    if (
      ((s =
        "string" == typeof a.dictionary
          ? ym_string2buf(a.dictionary)
          : "[object ArrayBuffer]" === p6.call(a.dictionary)
          ? new Uint8Array(a.dictionary)
          : a.dictionary),
      (i = vm_deflateSetDictionary(this.strm, s)) !== Av)
    )
      throw Error(Td[i]);
    this._dict_set = !0;
  }
}
function Zx(e, a) {
  let i = new Cm(a);
  if ((i.push(e, !0), i.err)) throw i.msg || Td[i.err];
  return i.result;
}
(Cm.prototype.push = function (e, a) {
  let i = this.strm,
    s = this.options.chunkSize,
    n,
    r;
  if (this.ended) return !1;
  for (
    r = a === ~~a ? a : !0 === a ? Xue : Que,
      i.input =
        "string" == typeof e
          ? ym_string2buf(e)
          : "[object ArrayBuffer]" === p6.call(e)
          ? new Uint8Array(e)
          : e,
      i.next_in = 0,
      i.avail_in = i.input.length;
    ;

  )
    if (
      (0 === i.avail_out &&
        ((i.output = new Uint8Array(s)), (i.next_out = 0), (i.avail_out = s)),
      (r === Zue || r === Jue) && i.avail_out <= 6)
    )
      this.onData(i.output.subarray(0, i.next_out)), (i.avail_out = 0);
    else {
      if ((n = vm_deflate(i, r)) === ehe)
        return (
          i.next_out > 0 && this.onData(i.output.subarray(0, i.next_out)),
          (n = vm_deflateEnd(this.strm)),
          this.onEnd(n),
          (this.ended = !0),
          n === Av
        );
      if (0 !== i.avail_out) {
        if (r > 0 && i.next_out > 0)
          this.onData(i.output.subarray(0, i.next_out)), (i.avail_out = 0);
        else if (0 === i.avail_in) break;
      } else this.onData(i.output);
    }
  return !0;
}),
  (Cm.prototype.onData = function (e) {
    this.chunks.push(e);
  }),
  (Cm.prototype.onEnd = function (e) {
    e === Av && (this.result = Ev_flattenChunks(this.chunks)),
      (this.chunks = []),
      (this.err = e),
      (this.msg = this.strm.msg);
  });
var uhe = {
  Deflate: Cm,
  deflate: Zx,
  deflateRaw: function e(a, i) {
    return ((i = i || {}).raw = !0), Zx(a, i);
  },
  gzip: function e(a, i) {
    return ((i = i || {}).gzip = !0), Zx(a, i);
  },
  constants: Dd,
};
const Ov = 16209;
var fhe = function (e, a) {
  let i,
    s,
    n,
    r,
    l,
    h,
    o,
    d,
    _,
    $,
    u,
    f,
    c,
    m,
    w,
    g,
    b,
    p,
    v,
    k,
    x,
    y,
    R,
    z,
    E = e.state;
  (i = e.next_in),
    (R = e.input),
    (s = i + (e.avail_in - 5)),
    (n = e.next_out),
    (z = e.output),
    (r = n - (a - e.avail_out)),
    (l = n + (e.avail_out - 257)),
    (h = E.dmax),
    (o = E.wsize),
    (d = E.whave),
    (_ = E.wnext),
    ($ = E.window),
    (u = E.hold),
    (f = E.bits),
    (c = E.lencode),
    (m = E.distcode),
    (w = (1 << E.lenbits) - 1),
    (g = (1 << E.distbits) - 1);
  e: do {
    f < 15 && ((u += R[i++] << f), (f += 8), (u += R[i++] << f), (f += 8)),
      (b = c[u & w]);
    t: for (;;) {
      if (((u >>>= p = b >>> 24), (f -= p), 0 == (p = (b >>> 16) & 255)))
        z[n++] = 65535 & b;
      else {
        if (!(16 & p)) {
          if (0 == (64 & p)) {
            b = c[(65535 & b) + (u & ((1 << p) - 1))];
            continue t;
          }
          if (32 & p) {
            E.mode = 16191;
            break e;
          }
          (e.msg = "invalid literal/length code"), (E.mode = 16209);
          break e;
        }
        (v = 65535 & b),
          (p &= 15) &&
            (f < p && ((u += R[i++] << f), (f += 8)),
            (v += u & ((1 << p) - 1)),
            (u >>>= p),
            (f -= p)),
          f < 15 &&
            ((u += R[i++] << f), (f += 8), (u += R[i++] << f), (f += 8)),
          (b = m[u & g]);
        n: for (;;) {
          if (
            ((u >>>= p = b >>> 24), (f -= p), !(16 & (p = (b >>> 16) & 255)))
          ) {
            if (0 == (64 & p)) {
              b = m[(65535 & b) + (u & ((1 << p) - 1))];
              continue n;
            }
            (e.msg = "invalid distance code"), (E.mode = 16209);
            break e;
          }
          if (
            ((k = 65535 & b),
            f < (p &= 15) &&
              ((u += R[i++] << f),
              (f += 8) < p && ((u += R[i++] << f), (f += 8))),
            (k += u & ((1 << p) - 1)) > h)
          ) {
            (e.msg = "invalid distance too far back"), (E.mode = 16209);
            break e;
          }
          if (((u >>>= p), (f -= p), k > (p = n - r))) {
            if ((p = k - p) > d && E.sane) {
              (e.msg = "invalid distance too far back"), (E.mode = 16209);
              break e;
            }
            if (((x = 0), (y = $), 0 === _)) {
              if (((x += o - p), p < v)) {
                v -= p;
                do z[n++] = $[x++];
                while (--p);
                (x = n - k), (y = z);
              }
            } else if (_ < p) {
              if (((x += o + _ - p), (p -= _) < v)) {
                v -= p;
                do z[n++] = $[x++];
                while (--p);
                if (((x = 0), _ < v)) {
                  v -= p = _;
                  do z[n++] = $[x++];
                  while (--p);
                  (x = n - k), (y = z);
                }
              }
            } else if (((x += _ - p), p < v)) {
              v -= p;
              do z[n++] = $[x++];
              while (--p);
              (x = n - k), (y = z);
            }
            for (; v > 2; )
              (z[n++] = y[x++]), (z[n++] = y[x++]), (z[n++] = y[x++]), (v -= 3);
            v && ((z[n++] = y[x++]), v > 1 && (z[n++] = y[x++]));
          } else {
            x = n - k;
            do
              (z[n++] = z[x++]), (z[n++] = z[x++]), (z[n++] = z[x++]), (v -= 3);
            while (v > 2);
            v && ((z[n++] = z[x++]), v > 1 && (z[n++] = z[x++]));
          }
          break;
        }
      }
      break;
    }
  } while (i < s && n < l);
  (i -= v = f >> 3),
    (f -= v << 3),
    (u &= (1 << f) - 1),
    (e.next_in = i),
    (e.next_out = n),
    (e.avail_in = i < s ? s - i + 5 : 5 - (i - s)),
    (e.avail_out = n < l ? l - n + 257 : 257 - (n - l)),
    (E.hold = u),
    (E.bits = f);
};
const phe = new Uint16Array([
    3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67,
    83, 99, 115, 131, 163, 195, 227, 258, 0, 0,
  ]),
  mhe = new Uint8Array([
    16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19,
    19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78,
  ]),
  ghe = new Uint16Array([
    1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513,
    769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0,
  ]),
  _he = new Uint8Array([
    16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24,
    24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64,
  ]);
var wm = (e, a, i, s, n, r, l, h) => {
  let o = h.bits,
    d,
    _,
    $,
    u,
    f,
    c,
    m = 0,
    w = 0,
    g = 0,
    b = 0,
    p = 0,
    v = 0,
    k = 0,
    x = 0,
    y = 0,
    R = 0,
    z = null,
    E = new Uint16Array(16),
    S = new Uint16Array(16),
    I,
    L,
    Z,
    F = null;
  for (m = 0; m <= 15; m++) E[m] = 0;
  for (w = 0; w < s; w++) E[a[i + w]]++;
  for (p = o, b = 15; b >= 1 && 0 === E[b]; b--);
  if ((p > b && (p = b), 0 === b))
    return (n[r++] = 20971520), (n[r++] = 20971520), (h.bits = 1), 0;
  for (g = 1; g < b && 0 === E[g]; g++);
  for (p < g && (p = g), x = 1, m = 1; m <= 15; m++)
    if (((x <<= 1), (x -= E[m]) < 0)) return -1;
  if (x > 0 && (0 === e || 1 !== b)) return -1;
  for (S[1] = 0, m = 1; m < 15; m++) S[m + 1] = S[m] + E[m];
  for (w = 0; w < s; w++) 0 !== a[i + w] && (l[S[a[i + w]]++] = w);
  if (
    (0 === e
      ? ((z = F = l), (c = 20))
      : 1 === e
      ? ((z = phe), (F = mhe), (c = 257))
      : ((z = ghe), (F = _he), (c = 0)),
    (R = 0),
    (w = 0),
    (m = g),
    (f = r),
    (v = p),
    (k = 0),
    ($ = -1),
    (u = (y = 1 << p) - 1),
    (1 === e && y > 852) || (2 === e && y > 592))
  )
    return 1;
  for (;;) {
    (I = m - k),
      l[w] + 1 < c
        ? ((L = 0), (Z = l[w]))
        : l[w] >= c
        ? ((L = F[l[w] - c]), (Z = z[l[w] - c]))
        : ((L = 96), (Z = 0)),
      (d = 1 << (m - k)),
      (g = _ = 1 << v);
    do n[f + (R >> k) + (_ -= d)] = (I << 24) | (L << 16) | Z | 0;
    while (0 !== _);
    for (d = 1 << (m - 1); R & d; ) d >>= 1;
    if ((0 !== d ? ((R &= d - 1), (R += d)) : (R = 0), w++, 0 == --E[m])) {
      if (m === b) break;
      m = a[i + l[w]];
    }
    if (m > p && (R & u) !== $) {
      for (
        0 === k && (k = p), f += g, x = 1 << (v = m - k);
        v + k < b && !((x -= E[v + k]) <= 0);

      )
        v++, (x <<= 1);
      if (((y += 1 << v), (1 === e && y > 852) || (2 === e && y > 592)))
        return 1;
      n[($ = R & u)] = (p << 24) | (v << 16) | (f - r) | 0;
    }
  }
  return 0 !== R && (n[f + R] = ((m - k) << 24) | 4194304), (h.bits = p), 0;
};
const {
    Z_FINISH: C6,
    Z_BLOCK: bhe,
    Z_TREES: Rv,
    Z_OK: Ed,
    Z_STREAM_END: yhe,
    Z_NEED_DICT: Che,
    Z_STREAM_ERROR: ks,
    Z_DATA_ERROR: w6,
    Z_MEM_ERROR: S6,
    Z_BUF_ERROR: whe,
    Z_DEFLATED: x6,
  } = Dd,
  Pv = 16180,
  Fv = 16190,
  wl = 16191,
  Nv = 16199,
  Lv = 16200,
  Ei = 16209,
  q6 = (e) =>
    ((e >>> 24) & 255) +
    ((e >>> 8) & 65280) +
    ((65280 & e) << 8) +
    ((255 & e) << 24);
function Dhe() {
  (this.strm = null),
    (this.mode = 0),
    (this.last = !1),
    (this.wrap = 0),
    (this.havedict = !1),
    (this.flags = 0),
    (this.dmax = 0),
    (this.check = 0),
    (this.total = 0),
    (this.head = null),
    (this.wbits = 0),
    (this.wsize = 0),
    (this.whave = 0),
    (this.wnext = 0),
    (this.window = null),
    (this.hold = 0),
    (this.bits = 0),
    (this.length = 0),
    (this.offset = 0),
    (this.extra = 0),
    (this.lencode = null),
    (this.distcode = null),
    (this.lenbits = 0),
    (this.distbits = 0),
    (this.ncode = 0),
    (this.nlen = 0),
    (this.ndist = 0),
    (this.have = 0),
    (this.next = null),
    (this.lens = new Uint16Array(320)),
    (this.work = new Uint16Array(288)),
    (this.lendyn = null),
    (this.distdyn = null),
    (this.sane = 0),
    (this.back = 0),
    (this.was = 0);
}
const Ad = (e) => {
    if (!e) return 1;
    let a = e.state;
    return !a || a.strm !== e || a.mode < 16180 || a.mode > 16211 ? 1 : 0;
  },
  Y6 = (e) => {
    if (Ad(e)) return ks;
    let a = e.state;
    return (
      (e.total_in = e.total_out = a.total = 0),
      (e.msg = ""),
      a.wrap && (e.adler = 1 & a.wrap),
      (a.mode = 16180),
      (a.last = 0),
      (a.havedict = 0),
      (a.flags = -1),
      (a.dmax = 32768),
      (a.head = null),
      (a.hold = 0),
      (a.bits = 0),
      (a.lencode = a.lendyn = new Int32Array(852)),
      (a.distcode = a.distdyn = new Int32Array(592)),
      (a.sane = 1),
      (a.back = -1),
      Ed
    );
  },
  Q6 = (e) => {
    if (Ad(e)) return ks;
    let a = e.state;
    return (a.wsize = 0), (a.whave = 0), (a.wnext = 0), Y6(e);
  },
  Z6 = (e, a) => {
    let i;
    if (Ad(e)) return ks;
    let s = e.state;
    return (
      a < 0 ? ((i = 0), (a = -a)) : ((i = 5 + (a >> 4)), a < 48 && (a &= 15)),
      a && (a < 8 || a > 15)
        ? ks
        : (null !== s.window && s.wbits !== a && (s.window = null),
          (s.wrap = i),
          (s.wbits = a),
          Q6(e))
    );
  },
  J6 = (e, a) => {
    if (!e) return ks;
    let i = new Dhe();
    (e.state = i), (i.strm = e), (i.window = null), (i.mode = 16180);
    let s = Z6(e, a);
    return s !== Ed && (e.state = null), s;
  };
let n2,
  r2,
  X6 = !0;
const Ihe = (e) => {
    if (X6) {
      (n2 = new Int32Array(512)), (r2 = new Int32Array(32));
      let a = 0;
      for (; a < 144; ) e.lens[a++] = 8;
      for (; a < 256; ) e.lens[a++] = 9;
      for (; a < 280; ) e.lens[a++] = 7;
      for (; a < 288; ) e.lens[a++] = 8;
      for (wm(1, e.lens, 0, 288, n2, 0, e.work, { bits: 9 }), a = 0; a < 32; )
        e.lens[a++] = 5;
      wm(2, e.lens, 0, 32, r2, 0, e.work, { bits: 5 }), (X6 = !1);
    }
    (e.lencode = n2), (e.lenbits = 9), (e.distcode = r2), (e.distbits = 5);
  },
  e5 = (e, a, i, s) => {
    let n,
      r = e.state;
    return (
      null === r.window &&
        ((r.wsize = 1 << r.wbits),
        (r.wnext = 0),
        (r.whave = 0),
        (r.window = new Uint8Array(r.wsize))),
      s >= r.wsize
        ? (r.window.set(a.subarray(i - r.wsize, i), 0),
          (r.wnext = 0),
          (r.whave = r.wsize))
        : ((n = r.wsize - r.wnext) > s && (n = s),
          r.window.set(a.subarray(i - s, i - s + n), r.wnext),
          (s -= n)
            ? (r.window.set(a.subarray(i - s, i), 0),
              (r.wnext = s),
              (r.whave = r.wsize))
            : ((r.wnext += n),
              r.wnext === r.wsize && (r.wnext = 0),
              r.whave < r.wsize && (r.whave += n))),
      0
    );
  };
var Sl_inflateReset = Q6,
  Sl_inflateInit2 = J6,
  Sl_inflate = (e, a) => {
    let i,
      s,
      n,
      r,
      l,
      h,
      o,
      d,
      _,
      $,
      u,
      f,
      c,
      m,
      w,
      g,
      b,
      p,
      v,
      k,
      x,
      y,
      R = 0,
      z = new Uint8Array(4),
      E,
      S,
      I = new Uint8Array([
        16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
      ]);
    if (Ad(e) || !e.output || (!e.input && 0 !== e.avail_in)) return ks;
    16191 === (i = e.state).mode && (i.mode = 16192),
      (l = e.next_out),
      (n = e.output),
      (o = e.avail_out),
      (r = e.next_in),
      (s = e.input),
      (h = e.avail_in),
      (d = i.hold),
      (_ = i.bits),
      ($ = h),
      (u = o),
      (y = Ed);
    e: for (;;)
      switch (i.mode) {
        case 16180:
          if (0 === i.wrap) {
            i.mode = 16192;
            break;
          }
          for (; _ < 16; ) {
            if (0 === h) break e;
            h--, (d += s[r++] << _), (_ += 8);
          }
          if (2 & i.wrap && 35615 === d) {
            0 === i.wbits && (i.wbits = 15),
              (i.check = 0),
              (z[0] = 255 & d),
              (z[1] = (d >>> 8) & 255),
              (i.check = Fr(i.check, z, 2, 0)),
              (d = 0),
              (_ = 0),
              (i.mode = 16181);
            break;
          }
          if (
            (i.head && (i.head.done = !1),
            !(1 & i.wrap) || (((255 & d) << 8) + (d >> 8)) % 31)
          ) {
            (e.msg = "incorrect header check"), (i.mode = 16209);
            break;
          }
          if ((15 & d) !== x6) {
            (e.msg = "unknown compression method"), (i.mode = 16209);
            break;
          }
          if (
            ((d >>>= 4),
            (_ -= 4),
            (x = 8 + (15 & d)),
            0 === i.wbits && (i.wbits = x),
            x > 15 || x > i.wbits)
          ) {
            (e.msg = "invalid window size"), (i.mode = 16209);
            break;
          }
          (i.dmax = 1 << i.wbits),
            (i.flags = 0),
            (e.adler = i.check = 1),
            (i.mode = 512 & d ? 16189 : 16191),
            (d = 0),
            (_ = 0);
          break;
        case 16181:
          for (; _ < 16; ) {
            if (0 === h) break e;
            h--, (d += s[r++] << _), (_ += 8);
          }
          if (((i.flags = d), (255 & i.flags) !== x6)) {
            (e.msg = "unknown compression method"), (i.mode = 16209);
            break;
          }
          if (57344 & i.flags) {
            (e.msg = "unknown header flags set"), (i.mode = 16209);
            break;
          }
          i.head && (i.head.text = (d >> 8) & 1),
            512 & i.flags &&
              4 & i.wrap &&
              ((z[0] = 255 & d),
              (z[1] = (d >>> 8) & 255),
              (i.check = Fr(i.check, z, 2, 0))),
            (d = 0),
            (_ = 0),
            (i.mode = 16182);
        case 16182:
          for (; _ < 32; ) {
            if (0 === h) break e;
            h--, (d += s[r++] << _), (_ += 8);
          }
          i.head && (i.head.time = d),
            512 & i.flags &&
              4 & i.wrap &&
              ((z[0] = 255 & d),
              (z[1] = (d >>> 8) & 255),
              (z[2] = (d >>> 16) & 255),
              (z[3] = (d >>> 24) & 255),
              (i.check = Fr(i.check, z, 4, 0))),
            (d = 0),
            (_ = 0),
            (i.mode = 16183);
        case 16183:
          for (; _ < 16; ) {
            if (0 === h) break e;
            h--, (d += s[r++] << _), (_ += 8);
          }
          i.head && ((i.head.xflags = 255 & d), (i.head.os = d >> 8)),
            512 & i.flags &&
              4 & i.wrap &&
              ((z[0] = 255 & d),
              (z[1] = (d >>> 8) & 255),
              (i.check = Fr(i.check, z, 2, 0))),
            (d = 0),
            (_ = 0),
            (i.mode = 16184);
        case 16184:
          if (1024 & i.flags) {
            for (; _ < 16; ) {
              if (0 === h) break e;
              h--, (d += s[r++] << _), (_ += 8);
            }
            (i.length = d),
              i.head && (i.head.extra_len = d),
              512 & i.flags &&
                4 & i.wrap &&
                ((z[0] = 255 & d),
                (z[1] = (d >>> 8) & 255),
                (i.check = Fr(i.check, z, 2, 0))),
              (d = 0),
              (_ = 0);
          } else i.head && (i.head.extra = null);
          i.mode = 16185;
        case 16185:
          if (
            1024 & i.flags &&
            ((f = i.length) > h && (f = h),
            f &&
              (i.head &&
                ((x = i.head.extra_len - i.length),
                i.head.extra ||
                  (i.head.extra = new Uint8Array(i.head.extra_len)),
                i.head.extra.set(s.subarray(r, r + f), x)),
              512 & i.flags && 4 & i.wrap && (i.check = Fr(i.check, s, f, r)),
              (h -= f),
              (r += f),
              (i.length -= f)),
            i.length)
          )
            break e;
          (i.length = 0), (i.mode = 16186);
        case 16186:
          if (2048 & i.flags) {
            if (0 === h) break e;
            f = 0;
            do
              (x = s[r + f++]),
                i.head &&
                  x &&
                  i.length < 65536 &&
                  (i.head.name += String.fromCharCode(x));
            while (x && f < h);
            if (
              (512 & i.flags && 4 & i.wrap && (i.check = Fr(i.check, s, f, r)),
              (h -= f),
              (r += f),
              x)
            )
              break e;
          } else i.head && (i.head.name = null);
          (i.length = 0), (i.mode = 16187);
        case 16187:
          if (4096 & i.flags) {
            if (0 === h) break e;
            f = 0;
            do
              (x = s[r + f++]),
                i.head &&
                  x &&
                  i.length < 65536 &&
                  (i.head.comment += String.fromCharCode(x));
            while (x && f < h);
            if (
              (512 & i.flags && 4 & i.wrap && (i.check = Fr(i.check, s, f, r)),
              (h -= f),
              (r += f),
              x)
            )
              break e;
          } else i.head && (i.head.comment = null);
          i.mode = 16188;
        case 16188:
          if (512 & i.flags) {
            for (; _ < 16; ) {
              if (0 === h) break e;
              h--, (d += s[r++] << _), (_ += 8);
            }
            if (4 & i.wrap && d !== (65535 & i.check)) {
              (e.msg = "header crc mismatch"), (i.mode = 16209);
              break;
            }
            (d = 0), (_ = 0);
          }
          i.head && ((i.head.hcrc = (i.flags >> 9) & 1), (i.head.done = !0)),
            (e.adler = i.check = 0),
            (i.mode = 16191);
          break;
        case 16189:
          for (; _ < 32; ) {
            if (0 === h) break e;
            h--, (d += s[r++] << _), (_ += 8);
          }
          (e.adler = i.check = q6(d)), (d = 0), (_ = 0), (i.mode = 16190);
        case 16190:
          if (0 === i.havedict)
            return (
              (e.next_out = l),
              (e.avail_out = o),
              (e.next_in = r),
              (e.avail_in = h),
              (i.hold = d),
              (i.bits = _),
              Che
            );
          (e.adler = i.check = 1), (i.mode = 16191);
        case 16191:
          if (a === bhe || a === Rv) break e;
        case 16192:
          if (i.last) {
            (d >>>= 7 & _), (_ -= 7 & _), (i.mode = 16206);
            break;
          }
          for (; _ < 3; ) {
            if (0 === h) break e;
            h--, (d += s[r++] << _), (_ += 8);
          }
          switch (((i.last = 1 & d), (_ -= 1), 3 & (d >>>= 1))) {
            case 0:
              i.mode = 16193;
              break;
            case 1:
              if ((Ihe(i), (i.mode = 16199), a === Rv)) {
                (d >>>= 2), (_ -= 2);
                break e;
              }
              break;
            case 2:
              i.mode = 16196;
              break;
            case 3:
              (e.msg = "invalid block type"), (i.mode = 16209);
          }
          (d >>>= 2), (_ -= 2);
          break;
        case 16193:
          for (d >>>= 7 & _, _ -= 7 & _; _ < 32; ) {
            if (0 === h) break e;
            h--, (d += s[r++] << _), (_ += 8);
          }
          if ((65535 & d) != ((d >>> 16) ^ 65535)) {
            (e.msg = "invalid stored block lengths"), (i.mode = 16209);
            break;
          }
          if (
            ((i.length = 65535 & d),
            (d = 0),
            (_ = 0),
            (i.mode = 16194),
            a === Rv)
          )
            break e;
        case 16194:
          i.mode = 16195;
        case 16195:
          if ((f = i.length)) {
            if ((f > h && (f = h), f > o && (f = o), 0 === f)) break e;
            n.set(s.subarray(r, r + f), l),
              (h -= f),
              (r += f),
              (o -= f),
              (l += f),
              (i.length -= f);
            break;
          }
          i.mode = 16191;
          break;
        case 16196:
          for (; _ < 14; ) {
            if (0 === h) break e;
            h--, (d += s[r++] << _), (_ += 8);
          }
          if (
            ((i.nlen = 257 + (31 & d)),
            (d >>>= 5),
            (_ -= 5),
            (i.ndist = 1 + (31 & d)),
            (d >>>= 5),
            (_ -= 5),
            (i.ncode = 4 + (15 & d)),
            (d >>>= 4),
            (_ -= 4),
            i.nlen > 286 || i.ndist > 30)
          ) {
            (e.msg = "too many length or distance symbols"), (i.mode = 16209);
            break;
          }
          (i.have = 0), (i.mode = 16197);
        case 16197:
          for (; i.have < i.ncode; ) {
            for (; _ < 3; ) {
              if (0 === h) break e;
              h--, (d += s[r++] << _), (_ += 8);
            }
            (i.lens[I[i.have++]] = 7 & d), (d >>>= 3), (_ -= 3);
          }
          for (; i.have < 19; ) i.lens[I[i.have++]] = 0;
          if (
            ((i.lencode = i.lendyn),
            (i.lenbits = 7),
            (E = { bits: i.lenbits }),
            (y = wm(0, i.lens, 0, 19, i.lencode, 0, i.work, E)),
            (i.lenbits = E.bits),
            y)
          ) {
            (e.msg = "invalid code lengths set"), (i.mode = 16209);
            break;
          }
          (i.have = 0), (i.mode = 16198);
        case 16198:
          for (; i.have < i.nlen + i.ndist; ) {
            for (
              ;
              (w = (R = i.lencode[d & ((1 << i.lenbits) - 1)]) >>> 24),
                (g = (R >>> 16) & 255),
                (b = 65535 & R),
                !(w <= _);

            ) {
              if (0 === h) break e;
              h--, (d += s[r++] << _), (_ += 8);
            }
            if (b < 16) (d >>>= w), (_ -= w), (i.lens[i.have++] = b);
            else {
              if (16 === b) {
                for (S = w + 2; _ < S; ) {
                  if (0 === h) break e;
                  h--, (d += s[r++] << _), (_ += 8);
                }
                if (((d >>>= w), (_ -= w), 0 === i.have)) {
                  (e.msg = "invalid bit length repeat"), (i.mode = 16209);
                  break;
                }
                (x = i.lens[i.have - 1]),
                  (f = 3 + (3 & d)),
                  (d >>>= 2),
                  (_ -= 2);
              } else if (17 === b) {
                for (S = w + 3; _ < S; ) {
                  if (0 === h) break e;
                  h--, (d += s[r++] << _), (_ += 8);
                }
                (d >>>= w),
                  (_ -= w),
                  (x = 0),
                  (f = 3 + (7 & d)),
                  (d >>>= 3),
                  (_ -= 3);
              } else {
                for (S = w + 7; _ < S; ) {
                  if (0 === h) break e;
                  h--, (d += s[r++] << _), (_ += 8);
                }
                (d >>>= w),
                  (_ -= w),
                  (x = 0),
                  (f = 11 + (127 & d)),
                  (d >>>= 7),
                  (_ -= 7);
              }
              if (i.have + f > i.nlen + i.ndist) {
                (e.msg = "invalid bit length repeat"), (i.mode = 16209);
                break;
              }
              for (; f--; ) i.lens[i.have++] = x;
            }
          }
          if (16209 === i.mode) break;
          if (0 === i.lens[256]) {
            (e.msg = "invalid code -- missing end-of-block"), (i.mode = 16209);
            break;
          }
          if (
            ((i.lenbits = 9),
            (E = { bits: i.lenbits }),
            (y = wm(1, i.lens, 0, i.nlen, i.lencode, 0, i.work, E)),
            (i.lenbits = E.bits),
            y)
          ) {
            (e.msg = "invalid literal/lengths set"), (i.mode = 16209);
            break;
          }
          if (
            ((i.distbits = 6),
            (i.distcode = i.distdyn),
            (E = { bits: i.distbits }),
            (y = wm(2, i.lens, i.nlen, i.ndist, i.distcode, 0, i.work, E)),
            (i.distbits = E.bits),
            y)
          ) {
            (e.msg = "invalid distances set"), (i.mode = 16209);
            break;
          }
          if (((i.mode = 16199), a === Rv)) break e;
        case 16199:
          i.mode = 16200;
        case 16200:
          if (h >= 6 && o >= 258) {
            (e.next_out = l),
              (e.avail_out = o),
              (e.next_in = r),
              (e.avail_in = h),
              (i.hold = d),
              (i.bits = _),
              fhe(e, u),
              (l = e.next_out),
              (n = e.output),
              (o = e.avail_out),
              (r = e.next_in),
              (s = e.input),
              (h = e.avail_in),
              (d = i.hold),
              (_ = i.bits),
              16191 === i.mode && (i.back = -1);
            break;
          }
          for (
            i.back = 0;
            (w = (R = i.lencode[d & ((1 << i.lenbits) - 1)]) >>> 24),
              (g = (R >>> 16) & 255),
              (b = 65535 & R),
              !(w <= _);

          ) {
            if (0 === h) break e;
            h--, (d += s[r++] << _), (_ += 8);
          }
          if (g && 0 == (240 & g)) {
            for (
              p = w, v = g, k = b;
              (w =
                (R = i.lencode[k + ((d & ((1 << (p + v)) - 1)) >> p)]) >>> 24),
                (g = (R >>> 16) & 255),
                (b = 65535 & R),
                !(p + w <= _);

            ) {
              if (0 === h) break e;
              h--, (d += s[r++] << _), (_ += 8);
            }
            (d >>>= p), (_ -= p), (i.back += p);
          }
          if (((d >>>= w), (_ -= w), (i.back += w), (i.length = b), 0 === g)) {
            i.mode = 16205;
            break;
          }
          if (32 & g) {
            (i.back = -1), (i.mode = 16191);
            break;
          }
          if (64 & g) {
            (e.msg = "invalid literal/length code"), (i.mode = 16209);
            break;
          }
          (i.extra = 15 & g), (i.mode = 16201);
        case 16201:
          if (i.extra) {
            for (S = i.extra; _ < S; ) {
              if (0 === h) break e;
              h--, (d += s[r++] << _), (_ += 8);
            }
            (i.length += d & ((1 << i.extra) - 1)),
              (d >>>= i.extra),
              (_ -= i.extra),
              (i.back += i.extra);
          }
          (i.was = i.length), (i.mode = 16202);
        case 16202:
          for (
            ;
            (w = (R = i.distcode[d & ((1 << i.distbits) - 1)]) >>> 24),
              (g = (R >>> 16) & 255),
              (b = 65535 & R),
              !(w <= _);

          ) {
            if (0 === h) break e;
            h--, (d += s[r++] << _), (_ += 8);
          }
          if (0 == (240 & g)) {
            for (
              p = w, v = g, k = b;
              (w =
                (R = i.distcode[k + ((d & ((1 << (p + v)) - 1)) >> p)]) >>> 24),
                (g = (R >>> 16) & 255),
                (b = 65535 & R),
                !(p + w <= _);

            ) {
              if (0 === h) break e;
              h--, (d += s[r++] << _), (_ += 8);
            }
            (d >>>= p), (_ -= p), (i.back += p);
          }
          if (((d >>>= w), (_ -= w), (i.back += w), 64 & g)) {
            (e.msg = "invalid distance code"), (i.mode = 16209);
            break;
          }
          (i.offset = b), (i.extra = 15 & g), (i.mode = 16203);
        case 16203:
          if (i.extra) {
            for (S = i.extra; _ < S; ) {
              if (0 === h) break e;
              h--, (d += s[r++] << _), (_ += 8);
            }
            (i.offset += d & ((1 << i.extra) - 1)),
              (d >>>= i.extra),
              (_ -= i.extra),
              (i.back += i.extra);
          }
          if (i.offset > i.dmax) {
            (e.msg = "invalid distance too far back"), (i.mode = 16209);
            break;
          }
          i.mode = 16204;
        case 16204:
          if (0 === o) break e;
          if (((f = u - o), i.offset > f)) {
            if ((f = i.offset - f) > i.whave && i.sane) {
              (e.msg = "invalid distance too far back"), (i.mode = 16209);
              break;
            }
            f > i.wnext
              ? ((f -= i.wnext), (c = i.wsize - f))
              : (c = i.wnext - f),
              f > i.length && (f = i.length),
              (m = i.window);
          } else (m = n), (c = l - i.offset), (f = i.length);
          f > o && (f = o), (o -= f), (i.length -= f);
          do n[l++] = m[c++];
          while (--f);
          0 === i.length && (i.mode = 16200);
          break;
        case 16205:
          if (0 === o) break e;
          (n[l++] = i.length), o--, (i.mode = 16200);
          break;
        case 16206:
          if (i.wrap) {
            for (; _ < 32; ) {
              if (0 === h) break e;
              h--, (d |= s[r++] << _), (_ += 8);
            }
            if (
              ((u -= o),
              (e.total_out += u),
              (i.total += u),
              4 & i.wrap &&
                u &&
                (e.adler = i.check =
                  i.flags
                    ? Fr(i.check, n, u, l - u)
                    : fm(i.check, n, u, l - u)),
              (u = o),
              4 & i.wrap && (i.flags ? d : q6(d)) !== i.check)
            ) {
              (e.msg = "incorrect data check"), (i.mode = 16209);
              break;
            }
            (d = 0), (_ = 0);
          }
          i.mode = 16207;
        case 16207:
          if (i.wrap && i.flags) {
            for (; _ < 32; ) {
              if (0 === h) break e;
              h--, (d += s[r++] << _), (_ += 8);
            }
            if (4 & i.wrap && d !== (4294967295 & i.total)) {
              (e.msg = "incorrect length check"), (i.mode = 16209);
              break;
            }
            (d = 0), (_ = 0);
          }
          i.mode = 16208;
        case 16208:
          y = yhe;
          break e;
        case 16209:
          y = w6;
          break e;
        case 16210:
          return S6;
        default:
          return ks;
      }
    return (
      (e.next_out = l),
      (e.avail_out = o),
      (e.next_in = r),
      (e.avail_in = h),
      (i.hold = d),
      (i.bits = _),
      (i.wsize ||
        (u !== e.avail_out &&
          i.mode < 16209 &&
          (i.mode < 16206 || a !== C6))) &&
        e5(e, e.output, e.next_out, u - e.avail_out),
      ($ -= e.avail_in),
      (u -= e.avail_out),
      (e.total_in += $),
      (e.total_out += u),
      (i.total += u),
      4 & i.wrap &&
        u &&
        (e.adler = i.check =
          i.flags
            ? Fr(i.check, n, u, e.next_out - u)
            : fm(i.check, n, u, e.next_out - u)),
      (e.data_type =
        i.bits +
        (i.last ? 64 : 0) +
        (16191 === i.mode ? 128 : 0) +
        (16199 === i.mode || 16194 === i.mode ? 256 : 0)),
      ((0 === $ && 0 === u) || a === C6) && y === Ed && (y = whe),
      y
    );
  },
  Sl_inflateEnd = (e) => {
    if (Ad(e)) return ks;
    let a = e.state;
    return a.window && (a.window = null), (e.state = null), Ed;
  },
  Sl_inflateGetHeader = (e, a) => {
    if (Ad(e)) return ks;
    let i = e.state;
    return 0 == (2 & i.wrap) ? ks : ((i.head = a), (a.done = !1), Ed);
  },
  Sl_inflateSetDictionary = (e, a) => {
    let i = a.length,
      s,
      n,
      r;
    return Ad(e) || (0 !== (s = e.state).wrap && 16190 !== s.mode)
      ? ks
      : 16190 === s.mode && (n = fm((n = 1), a, i, 0)) !== s.check
      ? w6
      : (r = e5(e, a, i, i))
      ? ((s.mode = 16210), S6)
      : ((s.havedict = 1), Ed);
  },
  $he = function e() {
    (this.text = 0),
      (this.time = 0),
      (this.xflags = 0),
      (this.os = 0),
      (this.extra = null),
      (this.extra_len = 0),
      (this.name = ""),
      (this.comment = ""),
      (this.hcrc = 0),
      (this.done = !1);
  };
const t5 = Object.prototype.toString,
  {
    Z_NO_FLUSH: zhe,
    Z_FINISH: Whe,
    Z_OK: Sm,
    Z_STREAM_END: a2,
    Z_NEED_DICT: s2,
    Z_STREAM_ERROR: Khe,
    Z_DATA_ERROR: n5,
    Z_MEM_ERROR: qhe,
  } = Dd;
function xm(e) {
  this.options = Ev_assign(
    { chunkSize: 65536, windowBits: 15, to: "" },
    e || {}
  );
  let a = this.options;
  a.raw &&
    a.windowBits >= 0 &&
    a.windowBits < 16 &&
    ((a.windowBits = -a.windowBits),
    0 === a.windowBits && (a.windowBits = -15)),
    a.windowBits >= 0 &&
      a.windowBits < 16 &&
      !(e && e.windowBits) &&
      (a.windowBits += 32),
    a.windowBits > 15 &&
      a.windowBits < 48 &&
      0 == (15 & a.windowBits) &&
      (a.windowBits |= 15),
    (this.err = 0),
    (this.msg = ""),
    (this.ended = !1),
    (this.chunks = []),
    (this.strm = new f6()),
    (this.strm.avail_out = 0);
  let i = Sl_inflateInit2(this.strm, a.windowBits);
  if (
    i !== Sm ||
    ((this.header = new $he()),
    Sl_inflateGetHeader(this.strm, this.header),
    a.dictionary &&
      ("string" == typeof a.dictionary
        ? (a.dictionary = ym_string2buf(a.dictionary))
        : "[object ArrayBuffer]" === t5.call(a.dictionary) &&
          (a.dictionary = new Uint8Array(a.dictionary)),
      a.raw && (i = Sl_inflateSetDictionary(this.strm, a.dictionary)) !== Sm))
  )
    throw Error(Td[i]);
}
function o2(e, a) {
  let i = new xm(a);
  if ((i.push(e), i.err)) throw i.msg || Td[i.err];
  return i.result;
}
(xm.prototype.push = function (e, a) {
  let i = this.strm,
    s = this.options.chunkSize,
    n = this.options.dictionary,
    r,
    l,
    h;
  if (this.ended) return !1;
  for (
    l = a === ~~a ? a : !0 === a ? Whe : zhe,
      i.input = "[object ArrayBuffer]" === t5.call(e) ? new Uint8Array(e) : e,
      i.next_in = 0,
      i.avail_in = i.input.length;
    ;

  ) {
    for (
      0 === i.avail_out &&
        ((i.output = new Uint8Array(s)), (i.next_out = 0), (i.avail_out = s)),
        (r = Sl_inflate(i, l)) === s2 &&
          n &&
          ((r = Sl_inflateSetDictionary(i, n)) === Sm
            ? (r = Sl_inflate(i, l))
            : r === n5 && (r = s2));
      i.avail_in > 0 && r === a2 && i.state.wrap > 0 && 0 !== e[i.next_in];

    )
      Sl_inflateReset(i), (r = Sl_inflate(i, l));
    switch (r) {
      case Khe:
      case n5:
      case s2:
      case qhe:
        return this.onEnd(r), (this.ended = !0), !1;
    }
    if (((h = i.avail_out), i.next_out && (0 === i.avail_out || r === a2))) {
      if ("string" === this.options.to) {
        let o = ym_utf8border(i.output, i.next_out),
          d = i.next_out - o,
          _ = ym_buf2string(i.output, o);
        (i.next_out = d),
          (i.avail_out = s - d),
          d && i.output.set(i.output.subarray(o, o + d), 0),
          this.onData(_);
      } else
        this.onData(
          i.output.length === i.next_out
            ? i.output
            : i.output.subarray(0, i.next_out)
        );
    }
    if (r !== Sm || 0 !== h) {
      if (r === a2)
        return (
          (r = Sl_inflateEnd(this.strm)), this.onEnd(r), (this.ended = !0), !0
        );
      if (0 === i.avail_in) break;
    }
  }
  return !0;
}),
  (xm.prototype.onData = function (e) {
    this.chunks.push(e);
  }),
  (xm.prototype.onEnd = function (e) {
    e === Sm &&
      (this.result =
        "string" === this.options.to
          ? this.chunks.join("")
          : Ev_flattenChunks(this.chunks)),
      (this.chunks = []),
      (this.err = e),
      (this.msg = this.strm.msg);
  });
var tfe = {
  Inflate: xm,
  inflate: o2,
  inflateRaw: function e(a, i) {
    return ((i = i || {}).raw = !0), o2(a, i);
  },
  ungzip: o2,
  constants: Dd,
};
const { inflate: ofe } = tfe;
var r5 = ofe;
class vfe {
  constructor(e, a, i, s) {
    (this.images = []),
      (this.frames = {}),
      (this.framesByName = {}),
      (this.index = s),
      (this.name = a),
      (this.basePath = i);
    let n = new Ex(e);
    if ("RE$X" == n.ReadBoundedString16(!0)) {
      for (n.ReadUInt32(); n.HasMoreData && this.readChunk(n); );
      Object.values(this.frames).forEach(
        (e) => (this.framesByName[e.class] = e)
      );
    }
  }
  readChunk(e) {
    let a = e.ReadUInt16();
    if (0 == a || e.Size - e.Position < 4) return !1;
    let i = e.ReadUInt32();
    if (e.Size - e.Position < i) return !1;
    let s = e.ReadByteArray(i),
      n = new Ex(s, e.LittleEndian);
    switch (a) {
      case 2:
        return this.readCompressedChunks(s, e.LittleEndian);
      case 256:
        return this.readClipedImage(n);
      case 512:
        return this.readFrameData(n, !1);
      case 513:
        return this.readFrameData(n, !0);
      case 768:
        return this.readResourceNames(n);
    }
    return !0;
  }
  readClipedImage(e) {
    let a = e.ReadUInt16(),
      i = e.ReadByte(),
      s = e.ReadBoundedString16();
    return (
      9 == i && (s = this.name.replace(".rsx", a + ".png")),
      this.images.push({ id: a, name: s, resourceName: this.basePath + s }),
      !0
    );
  }
  readCompressedChunks(e, a) {
    let i = r5(e),
      s = new Ex(i, a);
    for (; s.HasMoreData && this.readChunk(s); );
    return !0;
  }
  readFrameData(e, a) {
    let i = e.ReadUInt16(),
      s = this.frames[i];
    return (
      null == s && ((s = { id: i }), (this.frames[s.id] = s)),
      (s.imageIndex = e.ReadUInt16()),
      (s.x = e.ReadInt16()),
      (s.y = e.ReadInt16()),
      (s.width = e.ReadInt16()),
      (s.height = e.ReadInt16()),
      (s.posX = e.ReadInt16()),
      (s.poxY = e.ReadInt16()),
      a &&
        (s.frame = {
          x: e.ReadInt16(),
          y: e.ReadInt16(),
          width: e.ReadInt16(),
          height: e.ReadInt16(),
        }),
      (s.image = this.images.find((e) => e.id == s.imageIndex)),
      !0
    );
  }
  readResourceNames(e) {
    e.ReadUInt16();
    let a = e.ReadBoundedString16(),
      i = (e.ReadByte(), e.ReadByte()),
      s = e.ReadUInt16();
    0 != (1 & i) && e.ReadBoundedString16(),
      0 != (2 & i) && e.ReadBoundedString16();
    for (let n = 0; n < s; n++) {
      let r = e.ReadByte();
      if (17 == r) {
        let l = e.ReadUInt16(),
          h = this.frames[l];
        null == h && ((h = { id: l }), (this.frames[h.id] = h)), (h.class = a);
      } else if (18 == r) {
        let o = e.ReadUInt16();
        for (let d = 0; d < o; d++) e.ReadUInt16();
      } else if (19 == r) {
        let _ = e.ReadUInt16();
        for (let $ = 0; $ < _; $++) e.ReadUInt32();
      }
    }
    return !0;
  }
  getByName(e) {
    return this.framesByName[e];
  }
  getAllResources() {
    return Object.values(this.frames).map((e) => e.class);
  }
  getImages() {
    return this.images;
  }
}

class Xx {
  constructor(vars) {
    (this.cachedImages = new Map()),
      (this.NXFlashVars = vars),
      (this.loaded = false),
      (this.index = null);
  }

  async loadIndex() {
    let file = this.NXFlashVars.index_url.slice(
      this.NXFlashVars.index_url.lastIndexOf("/") + 1
    );
    let ext = file.slice(file.lastIndexOf(".") + 1);
    if (ext == "gz") {
      return fetch(this.NXFlashVars.index_url)
        .then((r) => r.body.pipeThrough(new DecompressionStream("gzip")))
        .then((r) => new Response(r))
        .then((r) => r.json())
        .then((i) => (this.index = i));
    } else if (ext == "json") {
      return fetch(this.NXFlashVars.index_url)
        .then((r) => r.json())
        .then((i) => (this.index = i));
    }
  }

  async loadLib() {
    const lib_url = this.index["lib/lib.json.gz"].path;
    const defaultLibUrl = lib_url.split('.gz').shift();

    this.lib = await fetch(`${this.NXFlashVars.static_url}${defaultLibUrl}`).then(r => r.json());
  }

  async processResx(e, fileName, path, resource, filter) {
    let c = new vfe(e, fileName, path, {}),
      u = c.getAllResources();
    null != filter && (u = u.filter((T) => filter.some((k) => T.match(k))));

    let g = c
        .getImages()
        .map((T) =>
          this.getResxImage(
            `${this.NXFlashVars.static_url}${this.index[T.resourceName].path}`,
            T.id
          )
        ),
      b = await Promise.all(g),
      x = u
        .filter((T) => null != T && "" != T)
        .map((T) => {
          let k = c.getByName(T),
            X = fileName + "/" + k.class,
            img = b.find((q) => q.id == k.imageIndex).image;
          return this.storeImage(img, k.width, k.height, k.x, k.y, X, resource);
        });
    return Promise.all(x);
  }

  async processAtlas(str, fileName, path, resource, filter) {
    let c = new mp(str),
      u = c.getAllResources();
    null != filter &&
      (u = u.filter((T) => filter.some((k) => T.match(k.name))));

    let b = await this.getResxImage(
        `${this.NXFlashVars.static_url}${this.index[path + c.image].path}`,
        0
      ),
      x = u
        .filter((T) => !!T?.name)
        .map((T) => {
          let X = fileName + "/" + T.name,
            img = b.image;
          return this.storeImage(img, T.width, T.height, T.x, T.y, X, resource);
        });
    return Promise.all(x);
  }

  getResxImage(fullPath, i) {
    let s = new Image();
    s.crossOrigin = "Anonymous"; // to avoid CORS if used with Canvas
    return (
      new Promise((o, l) => {
        (s.onload = () => o()), (s.src = fullPath);
      }),
      {
        image: s,
        id: i,
      }
    );
  }

  storeImage(img, width, height, x, y, key, resource) {
    let g = window.document.createElement("canvas");
    g.width = width;
    g.height = height;
    g.getContext("2d").drawImage(img, x, y, width, height, 0, 0, width, height);

    return new Promise((r) => {
      g.toBlob((D) => {
        if (D) {
          let F = URL.createObjectURL(D);
          this.cachedImages.set(key, {
            url: F,
            image: img,
            x,
            y,
            width,
            height,
          });
          r();
        } else {
          r();
        }
      });
    });
  }

  async load(resources) {
    if (!this.index) {
      this.index = await this.loadIndex();
    }
    if (!this.lib) {
      await this.loadLib();
    }
    let p = resources.map(async ({ key, filter = null }) => {
      let file = key.slice(key.lastIndexOf("/") + 1),
        ext = file.slice(file.lastIndexOf(".") + 1),
        path = key.replace(file, "");
      const rsx_url = this.index[key].path;
      let c = this.NXFlashVars.platformNetwork + "/" + key;

      if (ext == "rsx") {
        const bytes = await fetch(
          `${this.NXFlashVars.static_url}${rsx_url}`
        ).then((r) => r.arrayBuffer());
        return this.processResx(bytes, file, path, c, filter);
      } else if (ext == "xml") {
        let str = await fetch(`${this.NXFlashVars.static_url}${rsx_url}`).then(
          (r) => r.text()
        );
        return this.processAtlas(str, file, path, c, filter);
      }
    });
    return Promise.all(p).then(_ => {
      this.loaded = true;
      console.info("Resources loaded");
      return this;
    })
  }

  getImageFromCache(key) {
    if (this.cachedImages.has(key)) {
      return new Promise((r) => {
        let url = this.cachedImages.get(key).url;
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function () {
          r(this);
        };
        img.src = url;
      });
    } else {
      console.error("cachedImages has no key: " + key);
    }
  }
  getResourcePath(n) {
    let e = this.index[n];
    return null == e ? null : this.NXFlashVars.static_url + e.path;
  }
  getResourceFromCache(n) {
    return null != this.cachedResources[n] ? this.cachedResources[n] : null;
  }
}

class mp {
  constructor(str) {
    const xml = new window.DOMParser().parseFromString(str, "text/xml");
    const o = this.xmlToJson(xml);
    this.image = o.TextureAtlas.__attributes__.imagePath;
    this.frames = o.TextureAtlas.SubTexture.map((i) => i.__attributes__);
  }

  xmlToJson(xml) {
    // Create an empty object to store the result
    var obj = {};

    // Check if the provided value is an Element node
    if (xml.nodeType === 1) {
      // If it's an Element node, process its attributes
      obj.__attributes__ = [...xml.attributes].reduce(
        (acc, { name, value }) => {
          acc[name] = value;
          return acc;
        },
        {}
      );
    }

    // Process child nodes
    if (xml.hasChildNodes()) {
      for (var item of xml.children) {
        var nodeName = item.nodeName;

        if (typeof obj[nodeName] === "undefined") {
          obj[nodeName] = this.xmlToJson(item);
        } else {
          if (typeof obj[nodeName].push === "undefined") {
            var old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(this.xmlToJson(item));
        }
      }
    } else if (xml.nodeType === 1) {
      obj.__text__ = xml.textContent.trim();
    }

    return obj;
  }

  getAllResources() {
    return this.frames;
  }

  getImage() {
    return this.image;
  }

  getByName(k) {
    return this.frames.find((f) => f.name == k);
  }
}

export default Xx;