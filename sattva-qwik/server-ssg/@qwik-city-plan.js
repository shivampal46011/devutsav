import { c as createContextId, a as componentQrl, i as inlinedQrl, u as useSignal, b as useLocation, d as useStore, e as useContextProvider, f as useVisibleTaskQrl, _ as _jsxQ, g as _noopQrl, h as _fnSignal, j as _wrapSignal, k as _jsxC, S as Slot, l as useLexicalScope, m as _IMMUTABLE, L as Link, n as _jsxBranch, F as Fragment, o as useContext, r as routeLoaderQrl, p as _wrapProp } from "./q-BlvUYfxD.js";
function getApiBase() {
  var _a;
  const pub = "http://localhost:5001" == null ? void 0 : "http://localhost:5001".replace(/\/$/, "");
  if (pub) return pub;
  if (typeof window !== "undefined") return "";
  const internal = typeof process !== "undefined" ? (_a = process.env.INTERNAL_API_URL) == null ? void 0 : _a.replace(/\/$/, "") : void 0;
  return internal || "http://localhost:5001";
}
const PulseCtx = createContextId("du.admin.pulse");
const BulkJobCtx = createContextId("du.admin.bulkJob");
const TOKEN_KEY = "du_admin_token";
const fmtTime = (s) => {
  if (!s) return "—";
  return new Date(s).toLocaleTimeString("en-GB", {
    hour12: false
  });
};
const fmtDate = (s) => {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-GB", {
    hour12: false
  });
};
const ms = (n) => n == null ? "—" : `${n}ms`;
const pct = (n) => n == null ? "—" : `${n}%`;
const dur = (n) => {
  if (n == null) return "—";
  if (n < 1e3) return `${n}ms`;
  if (n < 6e4) return `${(n / 1e3).toFixed(1)}s`;
  return `${(n / 6e4).toFixed(1)}m`;
};
const countdown = (s) => {
  if (!s) return "—";
  const diff = new Date(s).getTime() - Date.now();
  if (diff <= 0) return "now";
  const h = Math.floor(diff / 36e5);
  const m = Math.floor(diff % 36e5 / 6e4);
  const sec = Math.floor(diff % 6e4 / 1e3);
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};
const sparkPath = (data, w = 240, h = 40) => {
  if (!data.length) return "";
  const max = Math.max(...data.map((d) => d.c), 1);
  const stepX = w / Math.max(data.length - 1, 1);
  return data.map((d, i) => `${i === 0 ? "M" : "L"}${(i * stepX).toFixed(1)},${(h - d.c / max * h).toFixed(1)}`).join(" ");
};
const NAV = [
  {
    href: "/admin",
    label: "OVERVIEW"
  },
  {
    href: "/admin/pages",
    label: "PAGES"
  },
  {
    href: "/admin/blogs",
    label: "BLOGS"
  },
  {
    href: "/admin/scheduler",
    label: "SCHEDULER"
  },
  {
    href: "/admin/events",
    label: "EVENTS"
  },
  {
    href: "/admin/users",
    label: "USERS"
  },
  {
    href: "/admin/images",
    label: "IMAGES"
  }
];
function navActive(pathname, href) {
  const p = pathname.replace(/\/$/, "") || "/";
  const h = href.replace(/\/$/, "") || "/";
  if (h === "/admin") return p === "/admin";
  return p === h || p.startsWith(`${h}/`);
}
const s_c59C70aHz4Q = async () => {
  const [promptOpen, store, tokenSig] = useLexicalScope();
  if (!tokenSig.value) return;
  store.isLoading = true;
  try {
    const res = await fetch(`${getApiBase()}/api/admin/metrics/pulse`, {
      headers: {
        Authorization: `Bearer ${tokenSig.value}`
      }
    });
    if (res.status === 401) {
      store.errorMsg = "Invalid token";
      promptOpen.value = true;
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {
      }
      tokenSig.value = "";
      return;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    store.pulse = await res.json();
    store.lastFetch = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-GB", {
      hour12: false
    });
    store.errorMsg = "";
  } catch (e) {
    store.errorMsg = String((e == null ? void 0 : e.message) || e);
  } finally {
    store.isLoading = false;
  }
};
const s_9nOLUMtEEgg = (tok) => {
  const [fetchPulse, promptOpen, tokenSig] = useLexicalScope();
  if (!tok.trim()) return;
  try {
    localStorage.setItem(TOKEN_KEY, tok.trim());
  } catch {
  }
  tokenSig.value = tok.trim();
  promptOpen.value = false;
  fetchPulse();
};
const s_aGNYGt2B2BM = () => {
  const tokenSig = useSignal("");
  const promptOpen = useSignal(false);
  const progressOpen = useSignal(true);
  const loc = useLocation();
  const store = useStore({
    pulse: null,
    isLoading: false,
    errorMsg: "",
    lastFetch: ""
  });
  useContextProvider(PulseCtx, store);
  const bulk = useStore({
    active: false,
    current: "",
    queueNames: [],
    doneCount: 0,
    totalCount: 0,
    results: [],
    startedAt: "",
    label: "",
    collapsed: false
  });
  useContextProvider(BulkJobCtx, bulk);
  const fetchPulse = /* @__PURE__ */ inlinedQrl(s_c59C70aHz4Q, "s_c59C70aHz4Q", [
    promptOpen,
    store,
    tokenSig
  ]);
  useVisibleTaskQrl(/* @__PURE__ */ _noopQrl("s_ZCMt8s74Kzo", [
    bulk,
    fetchPulse,
    progressOpen,
    promptOpen,
    tokenSig
  ]));
  const submitToken = /* @__PURE__ */ inlinedQrl(s_9nOLUMtEEgg, "s_9nOLUMtEEgg", [
    fetchPulse,
    promptOpen,
    tokenSig
  ]);
  return /* @__PURE__ */ _jsxQ("div", null, {
    class: "min-h-screen bg-black text-[#e6e6e6] font-mono text-xs leading-tight"
  }, [
    /* @__PURE__ */ _jsxQ("style", null, {
      dangerouslySetInnerHTML: `
        .term-amber { color: #ffb000; }
        .term-cyan { color: #4fc3f7; }
        .term-green { color: #00ff7f; }
        .term-red { color: #ff4d4d; }
        .term-dim { color: #6b7280; }
        .term-panel { border: 1px solid #1f2937; background: #0a0a0a; }
        .term-row:hover { background: #111827; }
        .term-grid { display: grid; gap: 1px; background: #1f2937; }
        .term-cell { background: #0a0a0a; padding: 6px 10px; }
        .term-marquee { animation: tickerSlide 60s linear infinite; }
        @keyframes tickerSlide { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
      `
    }, null, 3, null),
    promptOpen.value && /* @__PURE__ */ _jsxQ("div", null, {
      class: "fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
    }, /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-panel p-6 max-w-md w-full"
    }, [
      /* @__PURE__ */ _jsxQ("h2", null, {
        class: "term-amber font-bold uppercase tracking-widest mb-2"
      }, "DEVUTSAV // ADMIN TERMINAL", 3, null),
      /* @__PURE__ */ _jsxQ("p", null, {
        class: "term-dim mb-4"
      }, "Authenticate to access the live metrics feed.", 3, null),
      /* @__PURE__ */ _jsxQ("input", null, {
        type: "password",
        placeholder: "ADMIN_API_TOKEN",
        autoFocus: true,
        class: "w-full bg-black border border-[#1f2937] focus:border-[#ffb000] px-3 py-2 outline-none text-[#e6e6e6]",
        onKeyDown$: /* @__PURE__ */ _noopQrl("s_mVrOAhdyK64", [
          submitToken
        ])
      }, null, 3, null),
      store.errorMsg && /* @__PURE__ */ _jsxQ("p", null, {
        class: "term-red mt-2"
      }, _fnSignal((p0) => p0.errorMsg, [
        store
      ], "p0.errorMsg"), 3, "s8_0"),
      /* @__PURE__ */ _jsxQ("p", null, {
        class: "term-dim mt-3 text-[10px]"
      }, "stored in localStorage. backend reads ADMIN_API_TOKEN from .env", 3, null)
    ], 1, null), 1, "s8_1"),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "border-b border-[#1f2937] bg-[#0a0a0a] px-3 py-1.5 flex items-center justify-between flex-wrap gap-2"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "flex items-center gap-3 flex-wrap"
      }, [
        /* @__PURE__ */ _jsxQ("a", null, {
          href: "/",
          class: "term-cyan hover:term-amber no-underline border border-[#1f2937] px-2 py-0.5"
        }, "← SITE", 3, null),
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "term-amber font-bold tracking-widest"
        }, "DEVUTSAV//ADMIN", 3, null),
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "term-dim"
        }, store.pulse ? fmtDate(store.pulse.now) : "—", 1, null),
        /* @__PURE__ */ _jsxQ("span", null, {
          class: _fnSignal((p0) => `${p0.isLoading ? "term-amber blink" : p0.errorMsg ? "term-red" : "term-green"}`, [
            store
          ], '`${p0.isLoading?"term-amber blink":p0.errorMsg?"term-red":"term-green"}`')
        }, [
          "● ",
          _fnSignal((p0) => p0.isLoading ? "SYNC" : p0.errorMsg ? "ERR" : "LIVE", [
            store
          ], 'p0.isLoading?"SYNC":p0.errorMsg?"ERR":"LIVE"')
        ], 3, null),
        store.errorMsg && /* @__PURE__ */ _jsxQ("span", null, {
          class: "term-red"
        }, _fnSignal((p0) => p0.errorMsg, [
          store
        ], "p0.errorMsg"), 3, "s8_2")
      ], 1, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "flex items-center gap-3"
      }, [
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "term-dim"
        }, [
          "last sync ",
          _fnSignal((p0) => p0.lastFetch || "—", [
            store
          ], 'p0.lastFetch||"—"')
        ], 3, null),
        /* @__PURE__ */ _jsxQ("button", null, {
          class: _fnSignal((p0) => `border border-[#1f2937] px-2 py-0.5 ${p0.value ? "term-amber" : "term-dim hover:term-amber"}`, [
            progressOpen
          ], '`border border-[#1f2937] px-2 py-0.5 ${p0.value?"term-amber":"term-dim hover:term-amber"}`'),
          title: "Toggle bulk progress card",
          onClick$: /* @__PURE__ */ _noopQrl("s_B8ORog1h5J8", [
            progressOpen
          ])
        }, [
          _fnSignal((p0) => p0.active ? "◐" : "○", [
            bulk
          ], 'p0.active?"◐":"○"'),
          " PROGRESS",
          _fnSignal((p0) => p0.totalCount ? ` ${p0.doneCount}/${p0.totalCount}` : "", [
            bulk
          ], 'p0.totalCount?` ${p0.doneCount}/${p0.totalCount}`:""')
        ], 3, null),
        /* @__PURE__ */ _jsxQ("button", null, {
          class: "term-cyan hover:term-amber border border-[#1f2937] px-2 py-0.5",
          onClick$: /* @__PURE__ */ _noopQrl("s_Eh3Tu3vD3ck", [
            fetchPulse
          ])
        }, "REFRESH", 3, null),
        /* @__PURE__ */ _jsxQ("button", null, {
          class: "term-dim hover:term-red border border-[#1f2937] px-2 py-0.5",
          onClick$: /* @__PURE__ */ _noopQrl("s_54dhUhYi0aE", [
            promptOpen,
            tokenSig
          ])
        }, "LOGOUT", 3, null)
      ], 3, null)
    ], 1, null),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "border-b border-[#1f2937] bg-black px-3 py-1 flex flex-wrap gap-1"
    }, NAV.map((n) => {
      const active = navActive(loc.url.pathname, n.href);
      return /* @__PURE__ */ _jsxQ("a", {
        href: _wrapSignal(n, "href"),
        class: `no-underline px-3 py-1 border ${active ? "term-amber border-[#ffb000] bg-[#1a1300]" : "term-cyan border-[#1f2937] hover:term-amber"}`
      }, null, _wrapSignal(n, "label"), 1, n.href);
    }), 1, null),
    /* @__PURE__ */ _jsxC(Slot, null, 3, "s8_3"),
    progressOpen.value && (bulk.active || bulk.results.length > 0) && (() => {
      const errs = bulk.results.filter((r) => !r.ok);
      const hasErr = errs.length > 0;
      const lastErr = errs[errs.length - 1];
      const stateColor = bulk.active ? "term-amber" : hasErr ? "term-red" : "term-green";
      const borderColor = bulk.active ? "#ffb000" : hasErr ? "#ff4d4d" : "#00ff7f";
      return /* @__PURE__ */ _jsxQ("div", {
        style: `border-color: ${borderColor};`
      }, {
        class: _fnSignal((p0) => `fixed bottom-3 right-3 z-40 term-panel max-w-md w-[min(92vw,28rem)] shadow-2xl ${p0.active ? "blink" : ""}`, [
          bulk
        ], '`fixed bottom-3 right-3 z-40 term-panel max-w-md w-[min(92vw,28rem)] shadow-2xl ${p0.active?"blink":""}`')
      }, [
        /* @__PURE__ */ _jsxQ("div", {
          style: `border-color: ${borderColor};`
        }, {
          class: "flex items-center justify-between px-3 py-1.5 border-b"
        }, [
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "flex items-center gap-2"
          }, [
            /* @__PURE__ */ _jsxQ("span", {
              class: `${stateColor} ${bulk.active ? "blink" : hasErr && !bulk.active ? "blink" : ""}`
            }, null, "●", 3, null),
            /* @__PURE__ */ _jsxQ("span", {
              class: `${stateColor} font-bold tracking-widest text-[11px]`
            }, null, [
              bulk.active ? "PROCESSING" : hasErr ? "COMPLETED WITH ERRORS" : "DONE",
              " · ",
              _fnSignal((p0) => p0.label || "BULK MD", [
                bulk
              ], 'p0.label||"BULK MD"')
            ], 1, null),
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "term-dim tabular-nums"
            }, [
              _fnSignal((p0) => p0.doneCount, [
                bulk
              ], "p0.doneCount"),
              "/",
              _fnSignal((p0) => p0.totalCount, [
                bulk
              ], "p0.totalCount")
            ], 3, null),
            hasErr && /* @__PURE__ */ _jsxQ("span", null, {
              class: "term-red tabular-nums text-[10px]"
            }, [
              "· ",
              _wrapSignal(errs, "length"),
              " ERR"
            ], 1, "s8_4")
          ], 1, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "flex gap-2"
          }, [
            /* @__PURE__ */ _jsxQ("button", null, {
              class: "term-cyan hover:term-amber border border-[#1f2937] px-2 py-0.5 text-[10px]",
              onClick$: /* @__PURE__ */ _noopQrl("s_eNiGKcvjDZA", [
                bulk
              ])
            }, _fnSignal((p0) => p0.collapsed ? "OPEN" : "HIDE", [
              bulk
            ], 'p0.collapsed?"OPEN":"HIDE"'), 3, null),
            !bulk.active && /* @__PURE__ */ _jsxQ("button", null, {
              class: "term-dim hover:term-red border border-[#1f2937] px-2 py-0.5 text-[10px]",
              onClick$: /* @__PURE__ */ _noopQrl("s_cqDyzBUTblI", [
                bulk
              ])
            }, "CLEAR", 3, "s8_5")
          ], 1, null)
        ], 1, null),
        !bulk.collapsed && /* @__PURE__ */ _jsxQ("div", null, {
          class: "p-3 space-y-2 max-h-72 overflow-y-auto"
        }, [
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "h-1.5 bg-[#1f2937]"
          }, /* @__PURE__ */ _jsxQ("div", null, {
            class: "h-full bg-[#ffb000] transition-all",
            style: _fnSignal((p0) => `width: ${p0.totalCount ? Math.round(p0.doneCount / p0.totalCount * 100) : 0}%`, [
              bulk
            ], "`width: ${p0.totalCount?Math.round(p0.doneCount/p0.totalCount*100):0}%`")
          }, null, 3, null), 3, null),
          bulk.active && /* @__PURE__ */ _jsxQ("div", null, {
            class: "text-[11px]"
          }, [
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "term-dim"
            }, "now: ", 3, null),
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "term-cyan"
            }, _fnSignal((p0) => p0.current || "…", [
              bulk
            ], 'p0.current||"…"'), 3, null)
          ], 3, "s8_6"),
          bulk.results.length > 0 && /* @__PURE__ */ _jsxQ("ul", null, {
            class: "text-[11px] space-y-0.5"
          }, bulk.results.slice(-8).reverse().map((r, i) => /* @__PURE__ */ _jsxQ("li", null, {
            class: "flex gap-2"
          }, [
            /* @__PURE__ */ _jsxQ("span", {
              class: r.ok ? "term-green" : "term-red"
            }, null, r.ok ? "✓" : "✗", 1, null),
            /* @__PURE__ */ _jsxQ("span", {
              title: _wrapSignal(r, "file")
            }, {
              class: "truncate flex-1"
            }, _wrapSignal(r, "file"), 1, null),
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "term-dim truncate max-w-[8rem]"
            }, r.ok ? r.slug : r.error, 1, null)
          ], 1, i)), 1, "s8_7"),
          hasErr && lastErr && /* @__PURE__ */ _jsxQ("div", null, {
            class: "border border-[#ff4d4d] bg-[#1a0000] p-2 text-[11px]"
          }, [
            /* @__PURE__ */ _jsxQ("div", null, {
              class: "term-red font-bold"
            }, "LAST ERROR", 3, null),
            /* @__PURE__ */ _jsxQ("div", null, {
              class: "term-dim"
            }, [
              "file: ",
              /* @__PURE__ */ _jsxQ("span", null, {
                class: "term-amber"
              }, _wrapSignal(lastErr, "file"), 1, null)
            ], 1, null),
            /* @__PURE__ */ _jsxQ("div", null, {
              class: "term-red break-words"
            }, _wrapSignal(lastErr, "error"), 1, null)
          ], 1, "s8_8"),
          /* @__PURE__ */ _jsxQ("a", null, {
            href: "/admin/blogs/bulk",
            class: "term-cyan hover:term-amber text-[10px] no-underline"
          }, "→ open bulk page", 3, null)
        ], 1, "s8_9")
      ], 1, "s8_10");
    })()
  ], 1, "s8_11");
};
const layout$1 = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_aGNYGt2B2BM, "s_aGNYGt2B2BM"));
const head$c = {
  title: "Admin Terminal — DevUtsav",
  meta: [
    {
      name: "robots",
      content: "noindex,nofollow"
    }
  ]
};
const AdminLayout_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  _auto_NAV: NAV,
  _auto_navActive: navActive,
  default: layout$1,
  head: head$c
}, Symbol.toStringTag, { value: "Module" }));
const s_J0otJgr2VmU = () => {
  return /* @__PURE__ */ _jsxQ("header", null, {
    class: "fixed top-0 w-full flex justify-center items-center px-6 h-16 bg-[#fff8f3]/80 dark:bg-[#211b10]/80 backdrop-blur-xl z-50 shadow-[0_20px_40px_rgba(85,67,54,0.08)]"
  }, /* @__PURE__ */ _jsxC(Link, {
    href: "/",
    class: "font-['Noto_Serif'] text-2xl tracking-[0.2em] font-bold text-[#8f4e00] dark:text-[#ff9933]",
    children: "DEVUTSAV",
    [_IMMUTABLE]: {
      href: _IMMUTABLE,
      class: _IMMUTABLE
    }
  }, 3, "xL_0"), 1, "xL_1");
};
const TopBar = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_J0otJgr2VmU, "s_J0otJgr2VmU"));
const s_Js3G4FcuntY = () => {
  const loc = useLocation();
  const path = loc.url.pathname;
  const linkClass = (href) => {
    const exact = href === "/" ? path === "/" : path.startsWith(href);
    return `flex flex-col items-center justify-center rounded-xl px-4 py-2 transition-transform duration-300 ease-out active:scale-90 ${exact ? "bg-[#ff9933]/10 dark:bg-[#ff9933]/20 text-[#8f4e00] dark:text-[#ff9933]" : "text-[#554336] dark:text-[#dbc2b0] hover:text-[#8f4e00] dark:hover:text-[#ff9933]"}`;
  };
  return /* @__PURE__ */ _jsxQ("nav", null, {
    class: "bg-[#fff8f3]/80 dark:bg-[#211b10]/80 backdrop-blur-xl fixed bottom-0 w-full z-50 rounded-t-[2rem] border-t-[0.5px] border-[#dbc2b0]/15 shadow-[0_-10px_30px_rgba(85,67,54,0.05)] left-0 flex justify-around items-center px-0.5 pb-6 pt-3 md:hidden gap-0"
  }, [
    /* @__PURE__ */ _jsxC(Link, {
      href: "/",
      class: linkClass("/"),
      children: [
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "material-symbols-outlined text-[20px]",
          style: "font-variation-settings: 'FILL' 1"
        }, "home_max", 3, null),
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "font-['Plus_Jakarta_Sans'] text-[9px] font-semibold tracking-tight mt-1"
        }, "Home", 3, null)
      ],
      [_IMMUTABLE]: {
        href: _IMMUTABLE
      }
    }, 3, "Se_0"),
    /* @__PURE__ */ _jsxC(Link, {
      href: "/analyzer",
      class: linkClass("/analyzer"),
      children: [
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "material-symbols-outlined text-[20px]"
        }, "psychology_alt", 3, null),
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "font-['Plus_Jakarta_Sans'] text-[9px] font-semibold tracking-tight mt-1"
        }, "Tools", 3, null)
      ],
      [_IMMUTABLE]: {
        href: _IMMUTABLE
      }
    }, 3, "Se_1"),
    /* @__PURE__ */ _jsxC(Link, {
      href: "/puja",
      class: linkClass("/puja"),
      children: [
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "material-symbols-outlined text-[20px]"
        }, "temple_hindu", 3, null),
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "font-['Plus_Jakarta_Sans'] text-[9px] font-semibold tracking-tight mt-1"
        }, "Puja", 3, null)
      ],
      [_IMMUTABLE]: {
        href: _IMMUTABLE
      }
    }, 3, "Se_2"),
    /* @__PURE__ */ _jsxC(Link, {
      href: "/chadhawa",
      class: linkClass("/chadhawa"),
      children: [
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "material-symbols-outlined text-[20px]"
        }, "local_florist", 3, null),
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "font-['Plus_Jakarta_Sans'] text-[9px] font-semibold tracking-tight mt-1"
        }, "Chadhawa", 3, null)
      ],
      [_IMMUTABLE]: {
        href: _IMMUTABLE
      }
    }, 3, "Se_3"),
    /* @__PURE__ */ _jsxC(Link, {
      href: "/whisper",
      class: linkClass("/whisper"),
      children: [
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "material-symbols-outlined text-[20px]"
        }, "record_voice_over", 3, null),
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "font-['Plus_Jakarta_Sans'] text-[9px] font-semibold tracking-tight mt-1"
        }, "Whisper", 3, null)
      ],
      [_IMMUTABLE]: {
        href: _IMMUTABLE
      }
    }, 3, "Se_4")
  ], 1, "Se_5");
};
const BottomNav = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_Js3G4FcuntY, "s_Js3G4FcuntY"));
const s_Pk6LEo0raGo = () => {
  useVisibleTaskQrl(/* @__PURE__ */ _noopQrl("s_iNngGRTgZtY"));
  return null;
};
const TrackerInit = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_Pk6LEo0raGo, "s_Pk6LEo0raGo"));
const s_0ur0J8m8Tps = () => {
  _jsxBranch();
  const loc = useLocation();
  const isAdmin = loc.url.pathname.startsWith("/admin");
  if (isAdmin) return /* @__PURE__ */ _jsxQ("div", null, {
    class: "bg-black text-[#e6e6e6] min-h-screen"
  }, /* @__PURE__ */ _jsxC(Slot, null, 3, "C4_0"), 1, "C4_1");
  return /* @__PURE__ */ _jsxQ("div", null, {
    class: "bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen"
  }, [
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "fixed inset-0 grainy-bg z-[100] pointer-events-none"
    }, null, 3, null),
    /* @__PURE__ */ _jsxC(TopBar, null, 3, "C4_2"),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "pt-16 pb-24 md:pb-8"
    }, /* @__PURE__ */ _jsxC(Slot, null, 3, "C4_3"), 1, null),
    /* @__PURE__ */ _jsxC(BottomNav, null, 3, "C4_4"),
    /* @__PURE__ */ _jsxC(TrackerInit, null, 3, "C4_5")
  ], 1, "C4_6");
};
const layout = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_0ur0J8m8Tps, "s_0ur0J8m8Tps"));
const Layout_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: layout
}, Symbol.toStringTag, { value: "Module" }));
const s_l2y10KnN3eY = (props) => {
  const ref = useSignal();
  useVisibleTaskQrl(/* @__PURE__ */ _noopQrl("s_krlq0cekC4g", [
    props,
    ref
  ]));
  return /* @__PURE__ */ _jsxQ("div", {
    ref
  }, {
    "data-section-id": _fnSignal((p0) => p0.id, [
      props
    ], "p0.id"),
    class: _fnSignal((p0) => p0.class, [
      props
    ], "p0.class")
  }, /* @__PURE__ */ _jsxC(Slot, null, 3, "IF_0"), 1, "IF_1");
};
const TrackedSection = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_l2y10KnN3eY, "s_l2y10KnN3eY"));
const SESSION_KEY = "du_session_id";
const QUEUE = [];
function getSessionId() {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = "du_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}
function endpoint() {
  return `${getApiBase()}/api/tracking/events`;
}
function flushSync() {
  if (!QUEUE.length) return;
  const payload = JSON.stringify({
    session_id: getSessionId(),
    events: QUEUE.splice(0, QUEUE.length)
  });
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([
        payload
      ], {
        type: "text/plain"
      });
      navigator.sendBeacon(endpoint(), blob);
      return;
    }
  } catch {
  }
  fetch(endpoint(), {
    method: "POST",
    body: payload,
    keepalive: true,
    headers: {
      "Content-Type": "text/plain"
    }
  }).catch(() => {
  });
}
let flushTimer = null;
function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushSync();
  }, 2e3);
}
function pushToDataLayer(type, evt) {
  const w = window;
  w.dataLayer = w.dataLayer || [];
  const payload = {
    event: type,
    page_path: evt.path,
    page_location: typeof location !== "undefined" ? location.href : void 0,
    page_title: typeof document !== "undefined" ? document.title : void 0,
    section_id: evt.section_id,
    blog_slug: evt.blog_slug,
    scroll_pct: evt.scroll_pct,
    duration_ms: evt.duration_ms,
    value: evt.value,
    meta: evt.meta,
    session_id: getSessionId()
  };
  for (const k of Object.keys(payload)) if (payload[k] === void 0 || payload[k] === null) delete payload[k];
  w.dataLayer.push(payload);
}
function isAdminPath(p) {
  const path = p ?? (typeof location !== "undefined" ? location.pathname : "");
  return path.startsWith("/admin");
}
function track(type, props = {}) {
  if (typeof window === "undefined") return;
  if (isAdminPath(props.path)) return;
  const evt = {
    type,
    path: props.path ?? location.pathname,
    ts: Date.now(),
    ...props
  };
  evt.session_id = getSessionId();
  QUEUE.push(evt);
  pushToDataLayer(type, evt);
  if (QUEUE.length >= 20) flushSync();
  else scheduleFlush();
}
const STORAGE_KEY = "du_guidance_unlocked_v1";
const PAYLOAD_KEY = "du_guidance_today";
const fakeTitle = "Today's Tip";
const fakeBody = '"Offer water to the rising sun today to strengthen your inner resolve and clear professional obstacles."';
const s_vEaZr40WLjQ = async (val) => {
  const [isSearchingPob, pobSuggestions] = useLexicalScope();
  if (val.length < 3) {
    pobSuggestions.value = [];
    return;
  }
  isSearchingPob.value = true;
  try {
    const res = await fetch(`${getApiBase()}/api/location/autocomplete?input=${encodeURIComponent(val)}`);
    pobSuggestions.value = await res.json();
  } catch {
    pobSuggestions.value = [];
  } finally {
    isSearchingPob.value = false;
  }
};
const s_d0Yo9uOzfDQ = async (description, placeId) => {
  const [form, isSearchingPob, pobSuggestions] = useLexicalScope();
  form.pob = description;
  form.pob_place_id = placeId;
  pobSuggestions.value = [];
  isSearchingPob.value = true;
  try {
    const res = await fetch(`${getApiBase()}/api/location/details?place_id=${placeId}`);
    const d = await res.json();
    if (d == null ? void 0 : d.lat) {
      form.pob_lat = d.lat;
      form.pob_lon = d.lng;
      form.pob_city = d.city || "";
      form.pob_state = d.state || "";
      form.pob_country = d.country || "";
    }
  } catch {
  } finally {
    isSearchingPob.value = false;
  }
};
const s_y8K809ddigE = () => {
  const [modalOpen] = useLexicalScope();
  modalOpen.value = true;
  track("section_click", {
    section_id: "guidance_unlock_open"
  });
};
const s_m2k9CM8mDXA = async () => {
  const [form, isUnlocked, modalOpen, submitting, tip, validationError] = useLexicalScope();
  validationError.value = "";
  if (!form.name.trim()) {
    validationError.value = "Name is required.";
    return;
  }
  const phoneClean = form.phone.replace(/\D/g, "");
  if (phoneClean.length < 6) {
    validationError.value = "Valid phone number required.";
    return;
  }
  if (!form.pob.trim()) {
    validationError.value = "Place of birth is required.";
    return;
  }
  if (!form.pob_lat || !form.pob_lon) {
    validationError.value = "Pick your place of birth from the suggestions.";
    return;
  }
  submitting.value = true;
  try {
    let session_id = "";
    try {
      session_id = localStorage.getItem("du_session_id") || "";
    } catch {
    }
    const isdClean = (() => {
      const raw = form.isd_code.trim();
      const digits = raw.replace(/\D/g, "");
      return digits ? `+${digits.slice(0, 4)}` : "+91";
    })();
    const res = await fetch(`${getApiBase()}/api/guidance/unlock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim() || void 0,
        isd_code: isdClean,
        phone: phoneClean,
        pob: form.pob.trim(),
        pob_lat: form.pob_lat ?? void 0,
        pob_lon: form.pob_lon ?? void 0,
        pob_city: form.pob_city || void 0,
        pob_state: form.pob_state || void 0,
        pob_country: form.pob_country || void 0,
        pob_place_id: form.pob_place_id || void 0,
        dob: form.dob.trim() || void 0,
        tob: form.tob_unknown ? void 0 : form.tob.trim() || void 0,
        email_subscribe: form.email_subscribe && Boolean(form.email.trim()),
        user_session_id: session_id || void 0
      })
    });
    if (!res.ok) throw new Error("submit_failed");
    const data = await res.json();
    const todayTip = {
      date: data.date,
      title: data.title,
      body: data.body
    };
    tip.value = todayTip;
    try {
      localStorage.setItem(STORAGE_KEY, "1");
      localStorage.setItem(PAYLOAD_KEY, JSON.stringify(todayTip));
      if (data.user) {
        localStorage.setItem("du_user", JSON.stringify(data.user));
        localStorage.setItem("du_user_id", data.user.id);
      }
    } catch {
    }
    isUnlocked.value = true;
    modalOpen.value = false;
    track("section_click", {
      section_id: "guidance_unlock_submit"
    });
    if (form.email_subscribe && form.email.trim()) track("section_click", {
      section_id: "guidance_email_subscribe"
    });
    if (form.tob_unknown) track("section_click", {
      section_id: "guidance_unlock_skip_tob"
    });
  } catch (err) {
    validationError.value = "Could not unlock right now. Please try again.";
  } finally {
    submitting.value = false;
  }
};
const s_pLgRn6PQhwo = () => {
  const isUnlocked = useSignal(false);
  const modalOpen = useSignal(false);
  const submitting = useSignal(false);
  const validationError = useSignal("");
  const tip = useSignal(null);
  const form = useStore({
    name: "",
    email: "",
    isd_code: "+91",
    phone: "",
    pob: "",
    dob: "",
    tob: "",
    pob_lat: null,
    pob_lon: null,
    pob_city: "",
    pob_state: "",
    pob_country: "",
    pob_place_id: "",
    tob_unknown: true,
    email_subscribe: true
  });
  const pobSuggestions = useSignal([]);
  const isSearchingPob = useSignal(false);
  const fetchPobSuggestions = /* @__PURE__ */ inlinedQrl(s_vEaZr40WLjQ, "s_vEaZr40WLjQ", [
    isSearchingPob,
    pobSuggestions
  ]);
  const selectPob = /* @__PURE__ */ inlinedQrl(s_d0Yo9uOzfDQ, "s_d0Yo9uOzfDQ", [
    form,
    isSearchingPob,
    pobSuggestions
  ]);
  useVisibleTaskQrl(/* @__PURE__ */ _noopQrl("s_0e7rayxItSM", [
    isUnlocked,
    tip
  ]));
  const openModal = /* @__PURE__ */ inlinedQrl(s_y8K809ddigE, "s_y8K809ddigE", [
    modalOpen
  ]);
  const submit = /* @__PURE__ */ inlinedQrl(s_m2k9CM8mDXA, "s_m2k9CM8mDXA", [
    form,
    isUnlocked,
    modalOpen,
    submitting,
    tip,
    validationError
  ]);
  const showTitle = isUnlocked.value && tip.value ? tip.value.title : fakeTitle;
  const showBody = isUnlocked.value && tip.value ? tip.value.body : fakeBody;
  return /* @__PURE__ */ _jsxC(Fragment, {
    children: [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "w-full bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/10 relative overflow-hidden min-h-[180px] md:min-h-[220px]"
      }, [
        /* @__PURE__ */ _jsxQ("div", null, {
          class: _fnSignal((p0) => p0.value ? "" : "blur-[6px] select-none pointer-events-none", [
            isUnlocked
          ], 'p0.value?"":"blur-[6px] select-none pointer-events-none"')
        }, [
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "flex items-center gap-3 mb-4"
          }, [
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "w-8 h-[1px] bg-primary"
            }, null, 3, null),
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "text-xs font-bold uppercase tracking-widest text-primary"
            }, _fnSignal((p0) => p0.value ? "Today's Guidance" : "Today's Tip", [
              isUnlocked
            ], `p0.value?"Today's Guidance":"Today's Tip"`), 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxQ("h3", null, {
            class: "font-headline text-xl font-bold text-on-surface mb-2 leading-tight"
          }, showTitle, 1, null),
          /* @__PURE__ */ _jsxQ("p", null, {
            class: "font-headline text-base md:text-lg italic text-on-surface leading-relaxed"
          }, showBody, 1, null)
        ], 1, null),
        !isUnlocked.value && /* @__PURE__ */ _jsxQ("div", null, {
          class: "absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-surface-container/30 to-surface-container/80 backdrop-blur-[1px] p-6 text-center"
        }, [
          /* @__PURE__ */ _jsxQ("span", null, {
            class: "material-symbols-outlined text-primary text-3xl mb-2",
            style: "font-variation-settings: 'FILL' 1"
          }, "lock", 3, null),
          /* @__PURE__ */ _jsxQ("p", null, {
            class: "text-sm text-on-surface-variant mb-4 max-w-xs"
          }, "Today's guidance is sealed. Unlock it to receive this morning's spiritual whisper.", 3, null),
          /* @__PURE__ */ _jsxQ("button", null, {
            class: "px-5 py-3 bg-primary text-on-primary font-bold text-sm rounded-xl shadow-lg active:scale-95 transition-transform inline-flex items-center gap-2 uppercase tracking-widest",
            onClick$: openModal
          }, [
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "material-symbols-outlined text-base"
            }, "lock_open", 3, null),
            "Unlock Daily Guidance"
          ], 3, null),
          /* @__PURE__ */ _jsxQ("p", null, {
            class: "text-[10px] text-on-surface-variant/60 mt-3"
          }, "Free · 30 seconds · no payment", 3, null)
        ], 3, "qO_0")
      ], 1, null),
      modalOpen.value && /* @__PURE__ */ _jsxQ("div", null, {
        class: "fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      }, /* @__PURE__ */ _jsxQ("div", null, {
        class: "bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
      }, [
        /* @__PURE__ */ _jsxQ("button", null, {
          class: "absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high",
          "aria-label": "Close",
          onClick$: /* @__PURE__ */ _noopQrl("s_CTNXZ2TuFdM", [
            modalOpen
          ])
        }, /* @__PURE__ */ _jsxQ("span", null, {
          class: "material-symbols-outlined text-on-surface-variant"
        }, "close", 3, null), 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary rounded-t-3xl"
        }, null, 3, null),
        /* @__PURE__ */ _jsxQ("h3", null, {
          class: "font-headline text-2xl font-black text-on-surface mb-1"
        }, "Unlock Today's Guidance", 3, null),
        /* @__PURE__ */ _jsxQ("p", null, {
          class: "text-sm text-on-surface-variant mb-6"
        }, "A few details about you so the guidance carries your name. We never share your info.", 3, null),
        validationError.value && /* @__PURE__ */ _jsxQ("p", null, {
          class: "text-xs font-bold text-error bg-error/10 p-3 rounded-lg mb-4"
        }, _fnSignal((p0) => p0.value, [
          validationError
        ], "p0.value"), 3, "qO_1"),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "space-y-4"
        }, [
          /* @__PURE__ */ _jsxQ("div", null, null, [
            /* @__PURE__ */ _jsxQ("label", null, {
              class: "block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1"
            }, "Name *", 3, null),
            /* @__PURE__ */ _jsxQ("input", null, {
              value: _fnSignal((p0) => p0.name, [
                form
              ], "p0.name"),
              class: "w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm",
              placeholder: "Your name",
              onInput$: /* @__PURE__ */ _noopQrl("s_y12Aq0pzahs", [
                form
              ])
            }, null, 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxQ("div", null, null, [
            /* @__PURE__ */ _jsxQ("label", null, {
              class: "block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1"
            }, "Phone *", 3, null),
            /* @__PURE__ */ _jsxQ("div", null, {
              class: "flex gap-2"
            }, [
              /* @__PURE__ */ _jsxQ("input", null, {
                type: "tel",
                value: _fnSignal((p0) => p0.isd_code, [
                  form
                ], "p0.isd_code"),
                class: "w-20 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-3 py-3 outline-none text-sm text-center font-bold",
                placeholder: "+91",
                "aria-label": "Country code",
                onInput$: /* @__PURE__ */ _noopQrl("s_Sb1oK1soC7w", [
                  form
                ])
              }, null, 3, null),
              /* @__PURE__ */ _jsxQ("input", null, {
                type: "tel",
                value: _fnSignal((p0) => p0.phone, [
                  form
                ], "p0.phone"),
                class: "flex-1 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm",
                placeholder: "10-digit phone",
                onInput$: /* @__PURE__ */ _noopQrl("s_KuTg0yQhTuY", [
                  form
                ])
              }, null, 3, null)
            ], 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "relative"
          }, [
            /* @__PURE__ */ _jsxQ("label", null, {
              class: "block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1"
            }, "Place of Birth *", 3, null),
            /* @__PURE__ */ _jsxQ("div", null, {
              class: "relative"
            }, [
              /* @__PURE__ */ _jsxQ("input", null, {
                type: "text",
                value: _fnSignal((p0) => p0.pob, [
                  form
                ], "p0.pob"),
                placeholder: "e.g. Varanasi, India",
                autoComplete: "off",
                class: "w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm",
                onInput$: /* @__PURE__ */ _noopQrl("s_JadR8xXYdKo", [
                  fetchPobSuggestions,
                  form
                ])
              }, null, 3, null),
              isSearchingPob.value && /* @__PURE__ */ _jsxQ("div", null, {
                class: "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"
              }, null, 3, "qO_2")
            ], 1, null),
            /* @__PURE__ */ _jsxQ("p", null, {
              class: "text-[10px] text-on-surface-variant/60 mt-1"
            }, "Pick the matching city from the list", 3, null),
            pobSuggestions.value.length > 0 && /* @__PURE__ */ _jsxQ("div", null, {
              class: "absolute top-[68px] left-0 right-0 bg-white border border-outline-variant/30 rounded-xl shadow-2xl z-30 overflow-hidden max-h-52 overflow-y-auto"
            }, pobSuggestions.value.map((place, idx) => /* @__PURE__ */ _jsxQ("div", {
              onClick$: /* @__PURE__ */ _noopQrl("s_BPGTOtYixss", [
                place,
                selectPob
              ])
            }, {
              class: "px-4 py-3 hover:bg-surface-variant border-b border-outline-variant/10 cursor-pointer text-sm font-medium transition-colors text-on-surface"
            }, _wrapSignal(place, "description"), 0, idx)), 1, "qO_3")
          ], 1, null),
          /* @__PURE__ */ _jsxQ("div", null, null, [
            /* @__PURE__ */ _jsxQ("label", null, {
              class: "block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1"
            }, "Email (optional)", 3, null),
            /* @__PURE__ */ _jsxQ("input", null, {
              type: "email",
              value: _fnSignal((p0) => p0.email, [
                form
              ], "p0.email"),
              class: "w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm",
              placeholder: "you@example.com",
              onInput$: /* @__PURE__ */ _noopQrl("s_rFxnKkDfrFY", [
                form
              ])
            }, null, 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxQ("div", null, null, [
            /* @__PURE__ */ _jsxQ("label", null, {
              class: "block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1"
            }, "Date of Birth (optional)", 3, null),
            /* @__PURE__ */ _jsxQ("input", null, {
              type: "date",
              value: _fnSignal((p0) => p0.dob, [
                form
              ], "p0.dob"),
              max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
              min: "1900-01-01",
              class: "w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm appearance-none",
              onInput$: /* @__PURE__ */ _noopQrl("s_AyAnmj8deVI", [
                form
              ])
            }, null, 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxQ("div", null, null, [
            /* @__PURE__ */ _jsxQ("div", null, {
              class: "flex items-center justify-between mb-1"
            }, [
              /* @__PURE__ */ _jsxQ("label", null, {
                class: "text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
              }, "Time of Birth (optional)", 3, null),
              /* @__PURE__ */ _jsxQ("label", null, {
                class: "flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant cursor-pointer"
              }, [
                /* @__PURE__ */ _jsxQ("input", null, {
                  type: "checkbox",
                  checked: _fnSignal((p0) => p0.tob_unknown, [
                    form
                  ], "p0.tob_unknown"),
                  class: "w-3.5 h-3.5 rounded border-outline-variant/30",
                  onChange$: /* @__PURE__ */ _noopQrl("s_jDCqk7vwQJM", [
                    form
                  ])
                }, null, 3, null),
                /* @__PURE__ */ _jsxQ("span", null, null, "I don't know", 3, null)
              ], 3, null)
            ], 3, null),
            /* @__PURE__ */ _jsxQ("input", null, {
              type: "time",
              step: 60,
              disabled: _fnSignal((p0) => p0.tob_unknown, [
                form
              ], "p0.tob_unknown"),
              value: _fnSignal((p0) => p0.tob, [
                form
              ], "p0.tob"),
              class: "w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm appearance-none disabled:opacity-50",
              onInput$: /* @__PURE__ */ _noopQrl("s_haigf2XqqpA", [
                form
              ])
            }, null, 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxQ("label", null, {
            class: "flex items-start gap-2 cursor-pointer pt-2 border-t border-outline-variant/20"
          }, [
            /* @__PURE__ */ _jsxQ("input", null, {
              type: "checkbox",
              checked: _fnSignal((p0) => p0.email_subscribe, [
                form
              ], "p0.email_subscribe"),
              class: "mt-1 w-4 h-4 rounded border-outline-variant/30",
              onChange$: /* @__PURE__ */ _noopQrl("s_ex2opEEX0Rw", [
                form
              ])
            }, null, 3, null),
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "text-xs text-on-surface-variant leading-relaxed"
            }, [
              "Send today's guidance to my email each morning. ",
              /* @__PURE__ */ _jsxQ("span", null, {
                class: "text-on-surface-variant/60"
              }, "(needs your email)", 3, null)
            ], 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxQ("button", null, {
            disabled: _fnSignal((p0) => p0.value, [
              submitting
            ], "p0.value"),
            class: "w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-xl active:scale-95 transition-transform text-sm uppercase tracking-widest disabled:opacity-60",
            onClick$: submit
          }, _fnSignal((p0) => p0.value ? "Unlocking…" : "Unlock my Guidance", [
            submitting
          ], 'p0.value?"Unlocking…":"Unlock my Guidance"'), 3, null),
          /* @__PURE__ */ _jsxQ("p", null, {
            class: "text-[10px] text-on-surface-variant/60 text-center"
          }, "Free · One-time form · No payment ever asked", 3, null)
        ], 1, null)
      ], 1, null), 1, "qO_4")
    ]
  }, 1, "qO_5");
};
const DailyGuidanceCard = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_pLgRn6PQhwo, "s_pLgRn6PQhwo"));
const blogPosts = [
  {
    id: "t1-maa-baglamukhi-puja",
    slug: "maa-baglamukhi-puja-chadhawa",
    title: "Maa Baglamukhi Puja & Chadhawa: Conquer Enemies and Obstacles",
    excerpt: "Discover the profound benefits of Maa Baglamukhi Puja. Learn how offering Chadhawa can help you defeat hidden enemies and remove life blockages.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDat1XnHmYaIoTuCHH0QDkjeSfeNPq5X-GCFUskPfoVu2tuTIyJie2CzNUW-Jmuzj3rG4XO79zDrjw_XhoKmgoV0j6skPoZT5dr40Qlu5tlLDDs7fKK4NAN4F-wAvCMvritqyv3iq7pplQXjUCD9-MrWA8OkdC5tHZHBxWiWnC-0iFcjIkawJZF7pp2OQdRSGxGcaX8oeFzbVADI9z7qnyJkQ5OUaHDfakuZsClIjg2brBFzBe-MVWglJzwysFh2-0e8cfty4Ue5eTh",
    content: `
      <h2>The Power of Maa Baglamukhi</h2>
      <p>Maa Baglamukhi is the eighth Mahavidya, known for her immense power to stun or paralyze enemies, gossip, and legal battles. Worshipping her brings unparalleled protection from evil forces, black magic, and hidden adversaries.</p>
      
      <h2>Why Perform Baglamukhi Puja?</h2>
      <p>If you are facing continuous harassment at work, struggling with unresolved court cases, or sensing negativity from competitors, Maa Baglamukhi Puja is your ultimate spiritual shield. It turns failures into success and defeats enemies definitively.</p>

      <h2>The Importance of Chadhawa</h2>
      <p>Offering <em>Chadhawa</em>—particularly yellow items like turmeric, yellow clothes, and besan laddoos—amplifies the rituals. Yellow is sacred to Maa Baglamukhi and represents the paralyzing force over negative energies.</p>

      <h3>Key Benefits:</h3>
      <ul>
        <li>Victory in legal disputes and court cases.</li>
        <li>Protection from unseen enemies and evil eyes.</li>
        <li>Enhanced convincing power and dominance over competitors.</li>
      </ul>
    `,
    ctaText: "Book Maa Baglamukhi Puja",
    ctaLink: "/market",
    category: "Puja + Chadhawa"
  },
  {
    id: "t2-kaal-bhairav-puja",
    slug: "kaal-bhairav-puja-chadhawa",
    title: "Kaal Bhairav Puja & Chadhawa: Overcome Fear and Bad Karma",
    excerpt: "Seek the blessings of Kaal Bhairav to remove deep-rooted fears, eliminate past bad karmas, and ensure a smooth spiritual journey.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6m6CVg0u7pbLG3B1wW4Dm7l9CWT56CWaYpE9aPMNMmGvKlLV_KktgdRX0d4-7xN8CSetlqNez5myg0jSFrCgXFcl0_yaVs_WNysNviVa_qxLtAx8pVR4543-d5hagasUL-4bo2BOtcsTV5HC5KjipbcfksiYi_CAPQWkEan2mrbr54j7LgjdNp6zUso1haxVjABbBv3t4YO6HfJm1yxVuF4mdT9twx5dZ0IRcn4DflGdRlTysm1D-f89bStlRfrMnSJOfBEha_Ajj",
    content: `
      <h2>Who is Kaal Bhairav?</h2>
      <p>Lord Kaal Bhairav is the fierce manifestation of Lord Shiva associated with time (Kaal) and destruction of fear. He is the guardian deity, deeply venerated to protect seekers from negative entities and premature death.</p>
      
      <h2>Why Perform Kaal Bhairav Puja?</h2>
      <p>For those struggling with nightmares, unknown phobias, or sudden losses, invoking Kaal Bhairav can restore order. This potent Puja destroys the internal enemies of lust, anger, and greed, laying the path for success and mental peace.</p>

      <h2>The Essence of the Offerings (Chadhawa)</h2>
      <p>Offering Chadhawa such as mustard oil, black sesame seeds, and imarti to Lord Bhairav pacifies the fierce energy. When offered with pure devotion, these items neutralize the malefic effects of Rahu and Ketu in one's horoscope.</p>

      <h3>Key Benefits:</h3>
      <ul>
        <li>Removal of obstacles and hidden enemies.</li>
        <li>Freedom from fear, anxiety, and phobias.</li>
        <li>Relief from malefic planetary effects (Navagraha Dosha).</li>
      </ul>
    `,
    ctaText: "Offer Chadhawa to Kaal Bhairav",
    ctaLink: "/market",
    category: "Puja + Chadhawa"
  },
  {
    id: "t3-vishnupad-vedi-gaya",
    slug: "lord-vishnu-chadhawa-vishnupad-vedi-gaya",
    title: "Lord Vishnu Chadhawa at VishnuPad Vedi Gaya ++ Ekadashi Angles",
    excerpt: "Learn the significance of offering Chadhawa at VishnuPad Vedi in Gaya, especially during Ekadashi, to attain Moksha for your ancestors.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDat1XnHmYaIoTuCHH0QDkjeSfeNPq5X-GCFUskPfoVu2tuTIyJie2CzNUW-Jmuzj3rG4XO79zDrjw_XhoKmgoV0j6skPoZT5dr40Qlu5tlLDDs7fKK4NAN4F-wAvCMvritqyv3iq7pplQXjUCD9-MrWA8OkdC5tHZHBxWiWnC-0iFcjIkawJZF7pp2OQdRSGxGcaX8oeFzbVADI9z7qnyJkQ5OUaHDfakuZsClIjg2brBFzBe-MVWglJzwysFh2-0e8cfty4Ue5eTh",
    content: `
      <h2>The Sacred Footprints of Lord Vishnu</h2>
      <p>The VishnuPad Temple in Gaya marks the profound site where Lord Vishnu subdued the asura Gayasur by placing His foot on his chest. Offering Chadhawa and performing Pind Daan here brings eternal peace to departed souls.</p>
      
      <h2>The Ekadashi Angle</h2>
      <p>Fasting and offering Chadhawa on Ekadashi at this sacred site multiplies the spiritual merits exponentially. Ekadashi is naturally beloved by Lord Vishnu, and combining this fast with rituals at VishnuPad creates a powerful karmic cleanse.</p>

      <h2>Chadhawa that Pleases Hari</h2>
      <p>Devotees offer Tulsi leaves, yellow sweets, and specific grains. During Ekadashi, special non-grain offerings are made. It is believed that any prayer made at the footprints of the Lord with a pure heart is immediately answered.</p>

      <h3>Key Benefits:</h3>
      <ul>
        <li>Liberation (Moksha) for seven generations of ancestors.</li>
        <li>Forgiveness of accumulated sins and bad karma.</li>
        <li>Blessings of prosperity, health, and spiritual awakening.</li>
      </ul>
    `,
    ctaText: "Offer Chadhawa at VishnuPad",
    ctaLink: "/market",
    category: "Chadhawa"
  },
  {
    id: "t4-5-mukhi-rudraksha",
    slug: "5-mukhi-rudraksha-mala-benefits",
    title: "The Ultimate Guide to 5 Mukhi Rudraksha Mala",
    excerpt: "Explore the health, spiritual, and astrological benefits of the 5 Mukhi Rudraksha Mala. Find authentic recommendations on Amazon.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDat1XnHmYaIoTuCHH0QDkjeSfeNPq5X-GCFUskPfoVu2tuTIyJie2CzNUW-Jmuzj3rG4XO79zDrjw_XhoKmgoV0j6skPoZT5dr40Qlu5tlLDDs7fKK4NAN4F-wAvCMvritqyv3iq7pplQXjUCD9-MrWA8OkdC5tHZHBxWiWnC-0iFcjIkawJZF7pp2OQdRSGxGcaX8oeFzbVADI9z7qnyJkQ5OUaHDfakuZsClIjg2brBFzBe-MVWglJzwysFh2-0e8cfty4Ue5eTh",
    content: `
      <h2>What is a 5 Mukhi Rudraksha?</h2>
      <p>The 5 Mukhi (Panch Mukhi) Rudraksha represents Lord Shiva in His form as Kalagni Rudra. It is the most widely worn Rudraksha, known for bringing peace, health, and a calm mind to the wearer.</p>
      
      <h2>Astrological & Health Benefits</h2>
      <p>Governed by the planet Jupiter (Guru), it mitigates negative astrological effects and brings academic and professional growth. Medically, it is highly trusted for regulating blood pressure and offering relief from stress and cardiac ailments.</p>

      <h2>Why Wear a Mala?</h2>
      <p>Wearing a full mala of 108 beads creates an active energy field (aura) around the body. It acts as an armor against negative energies while keeping the mind focused and tranquil during meditation.</p>

      <h3>Key Benefits:</h3>
      <ul>
        <li>Reduces blood pressure and mitigates stress.</li>
        <li>Enhances memory, focus, and intellect.</li>
        <li>Deepens spiritual connection and meditation practices.</li>
      </ul>
    `,
    ctaText: "Buy Authentic 5 Mukhi Rudraksha on Amazon",
    ctaLink: "https://amazon.in",
    category: "Product Recommendation"
  },
  {
    id: "t5-karungali-mala",
    slug: "black-ebony-karungali-mala-benefits",
    title: "Karungali Mala: The Black Ebony Wood Miracle",
    excerpt: "Understand the power of the Karungali (Ebony wood) Mala in deflecting the evil eye, attracting wealth, and securing success in business.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDat1XnHmYaIoTuCHH0QDkjeSfeNPq5X-GCFUskPfoVu2tuTIyJie2CzNUW-Jmuzj3rG4XO79zDrjw_XhoKmgoV0j6skPoZT5dr40Qlu5tlLDDs7fKK4NAN4F-wAvCMvritqyv3iq7pplQXjUCD9-MrWA8OkdC5tHZHBxWiWnC-0iFcjIkawJZF7pp2OQdRSGxGcaX8oeFzbVADI9z7qnyJkQ5OUaHDfakuZsClIjg2brBFzBe-MVWglJzwysFh2-0e8cfty4Ue5eTh",
    content: `
      <h2>The Secret of Karungali (Black Ebony)</h2>
      <p>Karungali, or Black Ebony wood, is highly esteemed in Tamil Siddha traditions. The wood is naturally dense, sinking in water, and is believed to possess incredible electromagnetic properties that attract positive cosmic rays.</p>
      
      <h2>Protection Against the Evil Eye</h2>
      <p>Worn as a mala, Karungali acts as a sponge, absorbing toxic energy, jealousy, and the "evil eye" directed at the wearer. It is aggressively protective, ensuring that negative psychic attacks do not penetrate your aura.</p>

      <h2>Wealth and Professional Growth</h2>
      <p>Businessmen and professionals wear Karungali to remove financial blocks. It is closely associated with Mars (Mangal), boosting courage, action-oriented energy, and removing debts.</p>

      <h3>Key Benefits:</h3>
      <ul>
        <li>Ultimate protection from Drishti (Evil Eye).</li>
        <li>Boosts business success and clears financial hurdles.</li>
        <li>Balances planetary doshas, especially Mars.</li>
      </ul>
    `,
    ctaText: "Get Your Karungali Mala on Amazon",
    ctaLink: "https://amazon.in",
    category: "Product Recommendation"
  },
  {
    id: "t6-hybrid-rudraksha-karungali",
    slug: "hybrid-rudraksha-karungali-mala",
    title: "Hybrid Rudraksha + Karungali Mala: The Ultimate Power Combo",
    excerpt: "Why choose one when you can have both? Discover how the hybrid combination of Rudraksha and Karungali transforms your spiritual practice.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDat1XnHmYaIoTuCHH0QDkjeSfeNPq5X-GCFUskPfoVu2tuTIyJie2CzNUW-Jmuzj3rG4XO79zDrjw_XhoKmgoV0j6skPoZT5dr40Qlu5tlLDDs7fKK4NAN4F-wAvCMvritqyv3iq7pplQXjUCD9-MrWA8OkdC5tHZHBxWiWnC-0iFcjIkawJZF7pp2OQdRSGxGcaX8oeFzbVADI9z7qnyJkQ5OUaHDfakuZsClIjg2brBFzBe-MVWglJzwysFh2-0e8cfty4Ue5eTh",
    content: `
      <h2>The Best of Both Worlds</h2>
      <p>Combining the serene, consciousness-expanding energy of Rudraksha with the grounding, highly protective shield of Karungali creates an unparalleled spiritual accessory. This hybrid mala balances the upper and lower chakras simultaneously.</p>
      
      <h2>Synergy of Energies</h2>
      <p>While the 5 Mukhi Rudraksha connects you to Lord Shiva's tranquility and Jupiter's wisdom, the Karungali grounds that energy into material success and Mars's active courage. It stabilizes your energy field drastically.</p>

      <h2>Who Should Wear This?</h2>
      <p>It is perfect for individuals in high-stress professions, public figures facing continuous scrutiny, or anyone seeking a deep meditative state without losing out on worldly ambitions and wealth.</p>

      <h3>Key Benefits:</h3>
      <ul>
        <li>Holistic balance of mind, body, and material success.</li>
        <li>Amplified protection and manifestation capabilities.</li>
        <li>Reduces anger while boosting decisive action.</li>
      </ul>
    `,
    ctaText: "Shop the Hybrid Mala on Amazon",
    ctaLink: "https://amazon.in",
    category: "Product Recommendation"
  }
];
const s_SWxCTQ4nCyo = () => {
  const dailyReads = blogPosts.slice(0, 3);
  return /* @__PURE__ */ _jsxQ("main", null, {
    class: "px-3 md:px-0 max-w-5xl mx-auto relative pt-4 md:pt-6"
  }, [
    /* @__PURE__ */ _jsxC(TrackedSection, {
      id: "home_daily_reads",
      class: "px-3 md:px-6 mb-10 md:mb-12 block",
      children: [
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "flex items-end justify-between mb-4"
        }, [
          /* @__PURE__ */ _jsxQ("div", null, null, [
            /* @__PURE__ */ _jsxQ("h2", null, {
              class: "font-headline text-2xl font-bold text-on-surface"
            }, "Today's Reads", 3, null),
            /* @__PURE__ */ _jsxQ("p", null, {
              class: "text-on-surface-variant font-label text-xs uppercase tracking-widest"
            }, "Most-loved spiritual guides", 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxC(Link, {
            href: "/blog",
            class: "text-primary text-xs font-bold uppercase tracking-widest no-underline",
            children: "All",
            [_IMMUTABLE]: {
              href: _IMMUTABLE,
              class: _IMMUTABLE
            }
          }, 3, "aK_0")
        ], 1, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "flex overflow-x-auto gap-3 md:gap-4 no-scrollbar snap-x -mx-3 md:-mx-6 px-3 md:px-6 pb-2"
        }, dailyReads.map((post) => /* @__PURE__ */ _jsxC(Link, {
          href: `/blog/${post.slug}`,
          class: "snap-start shrink-0 w-[82%] sm:w-[55%] md:w-[40%] bg-surface-container rounded-2xl md:rounded-3xl p-4 md:p-5 border border-outline-variant/10 hover:border-primary/40 transition-colors no-underline text-inherit flex flex-col gap-3",
          children: [
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "self-start text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full"
            }, _wrapSignal(post, "category"), 1, null),
            /* @__PURE__ */ _jsxQ("h3", null, {
              class: "font-headline text-lg font-bold text-on-surface leading-snug line-clamp-3"
            }, _wrapSignal(post, "title"), 1, null),
            /* @__PURE__ */ _jsxQ("p", null, {
              class: "text-sm text-on-surface-variant leading-relaxed line-clamp-2"
            }, _wrapSignal(post, "excerpt"), 1, null),
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "mt-auto inline-flex items-center gap-1 text-primary text-xs font-bold pt-2"
            }, [
              "Read",
              /* @__PURE__ */ _jsxQ("span", null, {
                class: "material-symbols-outlined text-sm"
              }, "arrow_forward", 3, null)
            ], 3, null)
          ],
          [_IMMUTABLE]: {
            class: _IMMUTABLE
          }
        }, 1, post.id)), 1, null)
      ],
      [_IMMUTABLE]: {
        id: _IMMUTABLE,
        class: _IMMUTABLE
      }
    }, 1, "aK_1"),
    /* @__PURE__ */ _jsxC(TrackedSection, {
      id: "home_sacred_tools",
      class: "px-3 md:px-6 mb-12 md:mb-16 block",
      children: [
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "mb-5"
        }, /* @__PURE__ */ _jsxQ("h2", null, {
          class: "font-headline text-2xl font-bold text-on-surface"
        }, "Sacred Tools", 3, null), 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "grid grid-cols-2 gap-3 md:gap-4"
        }, [
          /* @__PURE__ */ _jsxC(Link, {
            href: "/kundali",
            class: "col-span-2 bg-secondary-container/60 rounded-2xl md:rounded-3xl p-5 md:p-6 relative overflow-hidden group",
            children: [
              /* @__PURE__ */ _jsxQ("div", null, {
                class: "relative z-10 flex flex-col h-full justify-between min-h-[140px] md:min-h-[160px]"
              }, [
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "material-symbols-outlined text-on-secondary-container text-4xl mb-4",
                  style: "font-variation-settings: 'FILL' 1"
                }, "picture_as_pdf", 3, null),
                /* @__PURE__ */ _jsxQ("div", null, null, [
                  /* @__PURE__ */ _jsxQ("h3", null, {
                    class: "font-headline text-xl font-bold text-on-secondary-container mb-1"
                  }, "Generate My Kundali", 3, null),
                  /* @__PURE__ */ _jsxQ("p", null, {
                    class: "text-sm text-on-surface-variant leading-relaxed"
                  }, "Personalised birth chart PDF, delivered instantly.", 3, null)
                ], 3, null)
              ], 3, null),
              /* @__PURE__ */ _jsxQ("div", null, {
                class: "absolute top-0 right-0 -translate-y-4 translate-x-4 opacity-10 group-hover:opacity-20 transition-opacity"
              }, /* @__PURE__ */ _jsxQ("span", null, {
                class: "material-symbols-outlined text-[120px]"
              }, "menu_book", 3, null), 3, null)
            ],
            [_IMMUTABLE]: {
              href: _IMMUTABLE,
              class: _IMMUTABLE
            }
          }, 3, "aK_2"),
          /* @__PURE__ */ _jsxC(Link, {
            href: "/analyzer",
            class: "col-span-2 bg-surface-container-low rounded-2xl md:rounded-3xl p-5 md:p-6 relative overflow-hidden group",
            children: [
              /* @__PURE__ */ _jsxQ("div", null, {
                class: "relative z-10 flex flex-col h-full justify-between min-h-[140px] md:min-h-[160px]"
              }, [
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "material-symbols-outlined text-primary text-4xl mb-4",
                  style: "font-variation-settings: 'FILL' 1"
                }, "psychology_alt", 3, null),
                /* @__PURE__ */ _jsxQ("div", null, null, [
                  /* @__PURE__ */ _jsxQ("h3", null, {
                    class: "font-headline text-xl font-bold text-on-surface mb-1"
                  }, "Kundali Dosha Calculator", 3, null),
                  /* @__PURE__ */ _jsxQ("p", null, {
                    class: "text-sm text-on-surface-variant leading-relaxed"
                  }, "Divine mapping of your current life challenges.", 3, null)
                ], 3, null)
              ], 3, null),
              /* @__PURE__ */ _jsxQ("div", null, {
                class: "absolute top-0 right-0 -translate-y-4 translate-x-4 opacity-10 group-hover:opacity-20 transition-opacity"
              }, /* @__PURE__ */ _jsxQ("span", null, {
                class: "material-symbols-outlined text-[120px]"
              }, "storm", 3, null), 3, null)
            ],
            [_IMMUTABLE]: {
              href: _IMMUTABLE,
              class: _IMMUTABLE
            }
          }, 3, "aK_3"),
          /* @__PURE__ */ _jsxC(Link, {
            href: "/horoscope",
            class: "bg-surface-container-highest rounded-2xl md:rounded-3xl p-4 md:p-5 aspect-square flex flex-col justify-between",
            children: [
              /* @__PURE__ */ _jsxQ("span", null, {
                class: "material-symbols-outlined text-secondary text-3xl",
                style: "font-variation-settings: 'FILL' 1"
              }, "auto_awesome", 3, null),
              /* @__PURE__ */ _jsxQ("h3", null, {
                class: "font-headline text-base font-bold text-on-surface"
              }, "Daily Horoscope", 3, null)
            ],
            [_IMMUTABLE]: {
              href: _IMMUTABLE,
              class: _IMMUTABLE
            }
          }, 3, "aK_4"),
          /* @__PURE__ */ _jsxC(Link, {
            href: "/whisper",
            class: "bg-tertiary-fixed rounded-2xl md:rounded-3xl p-4 md:p-5 aspect-square flex flex-col justify-between",
            children: [
              /* @__PURE__ */ _jsxQ("span", null, {
                class: "material-symbols-outlined text-on-tertiary-fixed text-3xl",
                style: "font-variation-settings: 'FILL' 1"
              }, "record_voice_over", 3, null),
              /* @__PURE__ */ _jsxQ("h3", null, {
                class: "font-headline text-base font-bold text-on-surface"
              }, "Nandi Whisper", 3, null)
            ],
            [_IMMUTABLE]: {
              href: _IMMUTABLE,
              class: _IMMUTABLE
            }
          }, 3, "aK_5"),
          /* @__PURE__ */ _jsxC(Link, {
            href: "/blog",
            class: "col-span-2 bg-primary/5 border border-primary/20 rounded-2xl md:rounded-3xl p-5 md:p-6 relative overflow-hidden group mt-1",
            children: /* @__PURE__ */ _jsxQ("div", null, {
              class: "relative z-10 flex items-center justify-between"
            }, [
              /* @__PURE__ */ _jsxQ("div", null, null, [
                /* @__PURE__ */ _jsxQ("h3", null, {
                  class: "font-headline text-xl font-bold text-primary mb-1"
                }, "Knowledge Hub", 3, null),
                /* @__PURE__ */ _jsxQ("p", null, {
                  class: "text-sm text-on-surface-variant leading-relaxed"
                }, "Spiritual wisdom & sacred item guides", 3, null)
              ], 3, null),
              /* @__PURE__ */ _jsxQ("span", null, {
                class: "material-symbols-outlined text-primary text-4xl",
                style: "font-variation-settings: 'FILL' 1"
              }, "menu_book", 3, null)
            ], 3, null),
            [_IMMUTABLE]: {
              href: _IMMUTABLE,
              class: _IMMUTABLE
            }
          }, 3, "aK_6")
        ], 1, null)
      ],
      [_IMMUTABLE]: {
        id: _IMMUTABLE,
        class: _IMMUTABLE
      }
    }, 1, "aK_7"),
    /* @__PURE__ */ _jsxC(TrackedSection, {
      id: "home_daily_guidance",
      class: "mb-12 md:mb-16 block",
      children: [
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "px-3 md:px-6 mb-5"
        }, [
          /* @__PURE__ */ _jsxQ("h2", null, {
            class: "font-headline text-2xl font-bold text-on-surface"
          }, "Daily Guidance", 3, null),
          /* @__PURE__ */ _jsxQ("p", null, {
            class: "text-on-surface-variant font-label text-xs uppercase tracking-widest"
          }, "Auspicious Insights for Today", 3, null)
        ], 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "px-3 md:px-6"
        }, /* @__PURE__ */ _jsxC(DailyGuidanceCard, null, 3, "aK_8"), 1, null)
      ],
      [_IMMUTABLE]: {
        id: _IMMUTABLE,
        class: _IMMUTABLE
      }
    }, 1, "aK_9")
  ], 1, "aK_10");
};
const index$k = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_SWxCTQ4nCyo, "s_SWxCTQ4nCyo"));
const head$b = {
  title: "Devutsav — Sacred Tools, Horoscopes & Spiritual Guidance",
  meta: [
    {
      name: "description",
      content: "AI Kundali Dosha analysis, daily horoscopes for all 12 zodiac signs, Nandi Whisper ritual, verified pujas & chadhawa offerings, and curated Hindu spiritual guides — all on Devutsav."
    },
    {
      name: "keywords",
      content: "kundali dosha, horoscope, nandi whisper, puja booking, chadhawa, spiritual guidance, vedic astrology, hindu rituals"
    },
    {
      property: "og:title",
      content: "Devutsav — Sacred Tools, Horoscopes & Spiritual Guidance"
    },
    {
      property: "og:description",
      content: "AI Kundali Dosha analysis, daily horoscopes, verified pujas & chadhawa, and a Hindu spiritual knowledge hub."
    }
  ]
};
const IndexRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index$k,
  head: head$b
}, Symbol.toStringTag, { value: "Module" }));
const SITE = "https://devutsav.com";
const STATIC_ROUTES = [
  {
    loc: "/",
    priority: "1.0",
    changefreq: "daily"
  },
  {
    loc: "/blog",
    priority: "0.9",
    changefreq: "daily"
  },
  {
    loc: "/blog/categories",
    priority: "0.7",
    changefreq: "weekly"
  },
  {
    loc: "/blog/articles",
    priority: "0.7",
    changefreq: "daily"
  },
  {
    loc: "/horoscope",
    priority: "0.9",
    changefreq: "daily"
  },
  {
    loc: "/analyzer",
    priority: "0.8",
    changefreq: "monthly"
  },
  {
    loc: "/whisper",
    priority: "0.8",
    changefreq: "monthly"
  },
  {
    loc: "/puja",
    priority: "0.8",
    changefreq: "weekly"
  },
  {
    loc: "/chadhawa",
    priority: "0.8",
    changefreq: "weekly"
  },
  {
    loc: "/ritual-guide",
    priority: "0.7",
    changefreq: "monthly"
  }
];
const onGet = ({ send }) => {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const urls = [
    ...STATIC_ROUTES.map((r) => ({
      ...r,
      lastmod: today
    })),
    ...blogPosts.map((p) => ({
      loc: `/blog/${p.slug}`,
      lastmod: today,
      changefreq: "weekly",
      priority: "0.6"
    }))
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
` + urls.map((u) => `  <url>
    <loc>${SITE}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n") + `
</urlset>
`;
  send(new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  }));
};
const SitemapRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  onGet
}, Symbol.toStringTag, { value: "Module" }));
const s_ha3oDhWZ4aY = async () => {
  const [seriesList] = useLexicalScope();
  try {
    const res = await fetch(`${getApiBase()}/api/admin/blog-series`);
    if (res.ok) seriesList.value = await res.json();
  } catch {
  }
};
const s_GEaCEIOLtL4 = async () => {
  const [fetchSeries, form, newCat, tokenSig, ui] = useLexicalScope();
  if (!newCat.name.trim()) {
    ui.err = "category name required";
    return;
  }
  newCat.creating = true;
  ui.err = "";
  ui.msg = "";
  try {
    const res = await fetch(`${getApiBase()}/api/admin/blog-series`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenSig.value}`
      },
      body: JSON.stringify({
        name: newCat.name,
        slug: newCat.slug,
        description: newCat.description
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    ui.msg = `Category created: ${data.name}`;
    newCat.name = "";
    newCat.slug = "";
    newCat.description = "";
    await fetchSeries();
    form.series_id = data._id;
  } catch (e) {
    ui.err = String((e == null ? void 0 : e.message) || e);
  } finally {
    newCat.creating = false;
  }
};
const s_yAX3YpseitA = async (id) => {
  const [fetchSeries, form, tokenSig, ui] = useLexicalScope();
  if (!confirm("Delete this category? Blogs in it will be uncategorised.")) return;
  try {
    const res = await fetch(`${getApiBase()}/api/admin/blog-series/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tokenSig.value}`
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (form.series_id === id) form.series_id = "";
    await fetchSeries();
  } catch (e) {
    ui.err = String((e == null ? void 0 : e.message) || e);
  }
};
const s_I0tYCLn0kO4 = async () => {
  const [bulk, form, queue, tokenSig, ui] = useLexicalScope();
  const files = queue.value;
  if (!files || !files.length) {
    ui.err = "pick .md files first";
    return;
  }
  if (bulk.active) {
    ui.err = "Another bulk job is still running";
    return;
  }
  ui.err = "";
  ui.msg = "";
  bulk.active = true;
  bulk.results = [];
  bulk.totalCount = files.length;
  bulk.doneCount = 0;
  bulk.queueNames = files.map((f) => f.name);
  bulk.startedAt = (/* @__PURE__ */ new Date()).toISOString();
  bulk.label = `${files.length} file${files.length > 1 ? "s" : ""}`;
  bulk.collapsed = false;
  for (const f of files) {
    bulk.current = f.name;
    try {
      const fd = new FormData();
      fd.append("files", f);
      if (form.series_id) fd.append("series_id", form.series_id);
      fd.append("sanitize", String(form.sanitize));
      fd.append("ai_seo", String(form.ai_seo));
      fd.append("status", form.status);
      const res = await fetch(`${getApiBase()}/api/admin/blogs/bulk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenSig.value}`
        },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) bulk.results = [
        ...bulk.results,
        {
          file: f.name,
          ok: false,
          error: data.error || `HTTP ${res.status}`
        }
      ];
      else bulk.results = [
        ...bulk.results,
        ...data.results || []
      ];
    } catch (e) {
      bulk.results = [
        ...bulk.results,
        {
          file: f.name,
          ok: false,
          error: String((e == null ? void 0 : e.message) || e)
        }
      ];
    }
    bulk.doneCount += 1;
  }
  bulk.current = "";
  bulk.active = false;
  ui.msg = `Done. ${bulk.results.filter((r) => r.ok).length}/${bulk.results.length} succeeded.`;
  queue.value = void 0;
};
const s_ilzRoZlMenk = () => {
  const tokenSig = useSignal("");
  const seriesList = useSignal([]);
  const form = useStore({
    series_id: "",
    sanitize: true,
    ai_seo: true,
    status: "DRAFT"
  });
  const newCat = useStore({
    name: "",
    slug: "",
    description: "",
    creating: false
  });
  const queue = useSignal(void 0);
  const ui = useStore({
    err: "",
    msg: ""
  });
  const bulk = useContext(BulkJobCtx);
  const fetchSeries = /* @__PURE__ */ inlinedQrl(s_ha3oDhWZ4aY, "s_ha3oDhWZ4aY", [
    seriesList
  ]);
  useVisibleTaskQrl(/* @__PURE__ */ _noopQrl("s_8sWNesh0Qgo", [
    fetchSeries,
    tokenSig
  ]));
  const createCategory = /* @__PURE__ */ inlinedQrl(s_GEaCEIOLtL4, "s_GEaCEIOLtL4", [
    fetchSeries,
    form,
    newCat,
    tokenSig,
    ui
  ]);
  const deleteCategory = /* @__PURE__ */ inlinedQrl(s_yAX3YpseitA, "s_yAX3YpseitA", [
    fetchSeries,
    form,
    tokenSig,
    ui
  ]);
  const process2 = /* @__PURE__ */ inlinedQrl(s_I0tYCLn0kO4, "s_I0tYCLn0kO4", [
    bulk,
    form,
    queue,
    tokenSig,
    ui
  ]);
  return /* @__PURE__ */ _jsxQ("div", null, {
    class: "p-3 space-y-3"
  }, [
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "flex items-center justify-between"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "term-amber font-bold tracking-widest"
      }, "BULK MD INGEST // PER-FILE", 3, null),
      /* @__PURE__ */ _jsxQ("a", null, {
        href: "/admin/blogs",
        class: "term-dim hover:term-amber border border-[#1f2937] px-2 py-0.5 no-underline"
      }, "← BACK", 3, null)
    ], 3, null),
    ui.err && /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-red border border-[#ff4d4d] px-2 py-1"
    }, _fnSignal((p0) => p0.err, [
      ui
    ], "p0.err"), 3, "n7_0"),
    ui.msg && /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-green border border-[#00ff7f] px-2 py-1"
    }, _fnSignal((p0) => p0.msg, [
      ui
    ], "p0.msg"), 3, "n7_1"),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-panel p-3 grid grid-cols-1 md:grid-cols-3 gap-3"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, null, [
        /* @__PURE__ */ _jsxQ("label", null, {
          class: "term-dim text-[10px] uppercase block mb-1"
        }, "Category / Series", 3, null),
        /* @__PURE__ */ _jsxQ("select", null, {
          value: _fnSignal((p0) => p0.series_id, [
            form
          ], "p0.series_id"),
          class: "w-full bg-black border border-[#1f2937] px-2 py-1 text-[#e6e6e6]",
          onChange$: /* @__PURE__ */ _noopQrl("s_eYu25cRSrb4", [
            form
          ])
        }, [
          /* @__PURE__ */ _jsxQ("option", null, {
            value: ""
          }, "— none —", 3, null),
          seriesList.value.map((s) => /* @__PURE__ */ _jsxQ("option", {
            value: _wrapSignal(s, "_id")
          }, null, s.name, 1, s._id))
        ], 1, null)
      ], 1, null),
      /* @__PURE__ */ _jsxQ("div", null, null, [
        /* @__PURE__ */ _jsxQ("label", null, {
          class: "term-dim text-[10px] uppercase block mb-1"
        }, "Status", 3, null),
        /* @__PURE__ */ _jsxQ("select", null, {
          value: _fnSignal((p0) => p0.status, [
            form
          ], "p0.status"),
          class: "w-full bg-black border border-[#1f2937] px-2 py-1 text-[#e6e6e6]",
          onChange$: /* @__PURE__ */ _noopQrl("s_r94OniGute0", [
            form
          ])
        }, [
          /* @__PURE__ */ _jsxQ("option", null, {
            value: "DRAFT"
          }, "DRAFT", 3, null),
          /* @__PURE__ */ _jsxQ("option", null, {
            value: "PUBLISHED"
          }, "PUBLISHED", 3, null)
        ], 3, null)
      ], 3, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "flex flex-col gap-1"
      }, [
        /* @__PURE__ */ _jsxQ("label", null, {
          class: "flex items-center gap-2 term-dim text-[10px] uppercase"
        }, [
          /* @__PURE__ */ _jsxQ("input", null, {
            type: "checkbox",
            checked: _fnSignal((p0) => p0.sanitize, [
              form
            ], "p0.sanitize"),
            onChange$: /* @__PURE__ */ _noopQrl("s_5iT0zmnoSJM", [
              form
            ])
          }, null, 3, null),
          "Sanitize / rewrite (plagiarism-safe)"
        ], 3, null),
        /* @__PURE__ */ _jsxQ("label", null, {
          class: "flex items-center gap-2 term-dim text-[10px] uppercase"
        }, [
          /* @__PURE__ */ _jsxQ("input", null, {
            type: "checkbox",
            checked: _fnSignal((p0) => p0.ai_seo, [
              form
            ], "p0.ai_seo"),
            onChange$: /* @__PURE__ */ _noopQrl("s_uiloN8MUXgY", [
              form
            ])
          }, null, 3, null),
          "AI auto-SEO (title, slug, description, keywords)"
        ], 3, null)
      ], 3, null)
    ], 1, null),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-panel p-3"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "term-cyan uppercase tracking-widest mb-2"
      }, "MANAGE CATEGORIES", 3, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "grid grid-cols-1 md:grid-cols-4 gap-2 mb-2"
      }, [
        /* @__PURE__ */ _jsxQ("input", null, {
          placeholder: "Category name *",
          value: _fnSignal((p0) => p0.name, [
            newCat
          ], "p0.name"),
          class: "bg-black border border-[#1f2937] focus:border-[#ffb000] px-2 py-1 outline-none text-[#e6e6e6]",
          onInput$: /* @__PURE__ */ _noopQrl("s_eMCxmUHPslg", [
            newCat
          ])
        }, null, 3, null),
        /* @__PURE__ */ _jsxQ("input", null, {
          placeholder: "slug (optional)",
          value: _fnSignal((p0) => p0.slug, [
            newCat
          ], "p0.slug"),
          class: "bg-black border border-[#1f2937] focus:border-[#ffb000] px-2 py-1 outline-none text-[#e6e6e6]",
          onInput$: /* @__PURE__ */ _noopQrl("s_4eZya4uta0Y", [
            newCat
          ])
        }, null, 3, null),
        /* @__PURE__ */ _jsxQ("input", null, {
          placeholder: "description (optional)",
          value: _fnSignal((p0) => p0.description, [
            newCat
          ], "p0.description"),
          class: "bg-black border border-[#1f2937] focus:border-[#ffb000] px-2 py-1 outline-none text-[#e6e6e6]",
          onInput$: /* @__PURE__ */ _noopQrl("s_ZFU7SdsuCys", [
            newCat
          ])
        }, null, 3, null),
        /* @__PURE__ */ _jsxQ("button", null, {
          disabled: _fnSignal((p0) => p0.creating, [
            newCat
          ], "p0.creating"),
          class: "term-amber border border-[#ffb000] px-3 py-1 hover:bg-[#1a1300] disabled:opacity-50",
          onClick$: createCategory
        }, _fnSignal((p0) => p0.creating ? "CREATING…" : "+ ADD CATEGORY", [
          newCat
        ], 'p0.creating?"CREATING…":"+ ADD CATEGORY"'), 3, null)
      ], 3, null),
      seriesList.value.length > 0 && /* @__PURE__ */ _jsxQ("ul", null, {
        class: "text-[11px] flex flex-wrap gap-2"
      }, seriesList.value.map((s) => /* @__PURE__ */ _jsxQ("li", null, {
        class: "border border-[#1f2937] px-2 py-0.5 flex items-center gap-2"
      }, [
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "term-amber"
        }, _wrapSignal(s, "name"), 1, null),
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "term-dim"
        }, [
          "/",
          _wrapSignal(s, "slug")
        ], 1, null),
        /* @__PURE__ */ _jsxQ("button", {
          onClick$: /* @__PURE__ */ _noopQrl("s_iSl3b5AAX5U", [
            deleteCategory,
            s
          ])
        }, {
          class: "term-red text-[10px] hover:underline"
        }, "×", 2, null)
      ], 1, s._id)), 1, "n7_2")
    ], 1, null),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-panel p-3"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "term-cyan uppercase tracking-widest mb-2"
      }, "DROP / SELECT .md FILES", 3, null),
      /* @__PURE__ */ _jsxQ("input", null, {
        type: "file",
        multiple: true,
        accept: ".md,.markdown,text/markdown",
        class: "block text-xs",
        onChange$: /* @__PURE__ */ _noopQrl("s_1DeUWSLvExA", [
          queue
        ])
      }, null, 3, null),
      queue.value && queue.value.length > 0 && /* @__PURE__ */ _jsxQ("ul", null, {
        class: "mt-2 text-[11px] term-dim list-disc pl-5"
      }, queue.value.map((f) => /* @__PURE__ */ _jsxQ("li", null, null, [
        _wrapSignal(f, "name"),
        " ",
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "term-dim"
        }, [
          "(",
          Math.round(f.size / 1024),
          " KB)"
        ], 1, null)
      ], 1, f.name)), 1, "n7_3"),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "flex items-center gap-2 mt-2"
      }, [
        /* @__PURE__ */ _jsxQ("button", null, {
          disabled: _fnSignal((p0) => p0.active, [
            bulk
          ], "p0.active"),
          class: "term-amber border border-[#ffb000] px-3 py-1 hover:bg-[#1a1300] disabled:opacity-50",
          onClick$: process2
        }, _fnSignal((p0) => p0.active ? `PROCESSING ${p0.current}…` : "START INGEST", [
          bulk
        ], 'p0.active?`PROCESSING ${p0.current}…`:"START INGEST"'), 3, null),
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "term-dim text-[10px]"
        }, "files are processed one-by-one. Sanitize uses Claude (slower, ~10s/file).", 3, null)
      ], 3, null)
    ], 1, null),
    bulk.results.length > 0 && /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-panel p-3"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "term-cyan uppercase tracking-widest mb-2"
      }, "RESULTS", 3, null),
      /* @__PURE__ */ _jsxQ("table", null, {
        class: "w-full text-xs"
      }, [
        /* @__PURE__ */ _jsxQ("thead", null, null, /* @__PURE__ */ _jsxQ("tr", null, {
          class: "term-dim text-[10px] uppercase"
        }, [
          /* @__PURE__ */ _jsxQ("th", null, {
            class: "text-left py-1"
          }, "FILE", 3, null),
          /* @__PURE__ */ _jsxQ("th", null, {
            class: "text-left"
          }, "STATUS", 3, null),
          /* @__PURE__ */ _jsxQ("th", null, {
            class: "text-left"
          }, "SLUG / ERROR", 3, null)
        ], 3, null), 3, null),
        /* @__PURE__ */ _jsxQ("tbody", null, null, bulk.results.map((r, i) => /* @__PURE__ */ _jsxQ("tr", null, {
          class: "border-t border-[#111827]"
        }, [
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "py-1.5"
          }, _wrapSignal(r, "file"), 1, null),
          /* @__PURE__ */ _jsxQ("td", {
            class: r.ok ? "term-green" : "term-red"
          }, null, r.ok ? "OK" : "FAIL", 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "term-dim"
          }, r.ok ? `${r.slug} — ${r.title}` : r.error, 1, null)
        ], 1, i)), 1, null)
      ], 1, null)
    ], 1, "n7_4")
  ], 1, "n7_5");
};
const index$j = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_ilzRoZlMenk, "s_ilzRoZlMenk"));
const AdminBlogsBulkRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index$j
}, Symbol.toStringTag, { value: "Module" }));
const s_IfwjSdLdEAM = () => {
  const [tokenSig] = useLexicalScope();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${tokenSig.value}`
  };
};
const s_Unr6yrO1pAE = async () => {
  const [form, headers, ui] = useLexicalScope();
  if (!form.source_md.trim()) {
    ui.err = "Paste source markdown first";
    return;
  }
  ui.err = "";
  ui.msg = "";
  ui.sanitizing = true;
  try {
    const res = await fetch(`${getApiBase()}/api/admin/blogs/sanitize`, {
      method: "POST",
      headers: await headers(),
      body: JSON.stringify({
        content_md: form.source_md
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    form.content_md = data.content_md || "";
    ui.msg = "Rewritten. Review the output below before saving.";
  } catch (e) {
    ui.err = String((e == null ? void 0 : e.message) || e);
  } finally {
    ui.sanitizing = false;
  }
};
const s_7XXlwbqwf1k = async () => {
  const [form, headers, ui] = useLexicalScope();
  if (!form.content_md.trim()) {
    ui.err = "No content to analyze";
    return;
  }
  ui.err = "";
  ui.msg = "";
  ui.seoing = true;
  try {
    const res = await fetch(`${getApiBase()}/api/admin/blogs/seo-meta`, {
      method: "POST",
      headers: await headers(),
      body: JSON.stringify({
        content_md: form.content_md
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    if (data.title) form.title = data.title;
    if (data.slug) form.slug = data.slug;
    if (data.excerpt) form.excerpt = data.excerpt;
    if (data.seo_title) form.seo_title = data.seo_title;
    if (data.seo_description) form.seo_description = data.seo_description;
    ui.msg = "AI filled title, slug, excerpt and SEO meta. Edit if needed.";
  } catch (e) {
    ui.err = String((e == null ? void 0 : e.message) || e);
  } finally {
    ui.seoing = false;
  }
};
const s_s0E1vq7aTbM = async (publish) => {
  const [form, headers, ui] = useLexicalScope();
  if (!form.content_md.trim()) {
    ui.err = "No content to save";
    return;
  }
  if (!form.title.trim()) {
    ui.err = "Title is required";
    return;
  }
  ui.err = "";
  ui.msg = "";
  ui.saving = true;
  try {
    const body = {
      title: form.title,
      slug: form.slug || void 0,
      series_id: form.series_id || void 0,
      excerpt: form.excerpt,
      image: form.image,
      seo_title: form.seo_title,
      seo_description: form.seo_description,
      og_image: form.og_image,
      coming_soon: form.coming_soon,
      content_md: form.content_md,
      status: publish ? "PUBLISHED" : "DRAFT"
    };
    const res = await fetch(`${getApiBase()}/api/admin/blogs`, {
      method: "POST",
      headers: await headers(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    ui.msg = `Saved as ${publish ? "PUBLISHED" : "DRAFT"} (slug: ${data.slug || data._id}).`;
  } catch (e) {
    ui.err = String((e == null ? void 0 : e.message) || e);
  } finally {
    ui.saving = false;
  }
};
const s_vVrAOsK7Lhk = (v) => {
  const [form] = useLexicalScope();
  return form.title = v;
};
const s_q4HU7TYgm6E = (v) => {
  const [form] = useLexicalScope();
  return form.slug = v;
};
const s_h0lhbQXh3Tc = (v) => {
  const [form] = useLexicalScope();
  return form.image = v;
};
const s_nJOvA0ChR0E = (v) => {
  const [form] = useLexicalScope();
  return form.excerpt = v;
};
const s_va3EIDsc9ik = (v) => {
  const [form] = useLexicalScope();
  return form.og_image = v;
};
const s_w6BVTY2t0GE = (v) => {
  const [form] = useLexicalScope();
  return form.seo_title = v;
};
const s_oIi3Mu6By24 = (v) => {
  const [form] = useLexicalScope();
  return form.seo_description = v;
};
const s_wXpG5PXTQ0Q = () => {
  const tokenSig = useSignal("");
  const seriesList = useSignal([]);
  const form = useStore({
    title: "",
    slug: "",
    series_id: "",
    excerpt: "",
    image: "",
    seo_title: "",
    seo_description: "",
    og_image: "",
    source_md: "",
    content_md: "",
    status: "DRAFT",
    coming_soon: false
  });
  const ui = useStore({
    sanitizing: false,
    saving: false,
    seoing: false,
    err: "",
    msg: ""
  });
  const headers = /* @__PURE__ */ inlinedQrl(s_IfwjSdLdEAM, "s_IfwjSdLdEAM", [
    tokenSig
  ]);
  useVisibleTaskQrl(/* @__PURE__ */ _noopQrl("s_gz0yCzf3aq4", [
    seriesList,
    tokenSig
  ]));
  const sanitize = /* @__PURE__ */ inlinedQrl(s_Unr6yrO1pAE, "s_Unr6yrO1pAE", [
    form,
    headers,
    ui
  ]);
  const autoSeo = /* @__PURE__ */ inlinedQrl(s_7XXlwbqwf1k, "s_7XXlwbqwf1k", [
    form,
    headers,
    ui
  ]);
  const save = /* @__PURE__ */ inlinedQrl(s_s0E1vq7aTbM, "s_s0E1vq7aTbM", [
    form,
    headers,
    ui
  ]);
  return /* @__PURE__ */ _jsxQ("div", null, {
    class: "p-3 space-y-3"
  }, [
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "flex items-center justify-between"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "term-amber font-bold tracking-widest"
      }, "NEW BLOG // SANITIZE & PUBLISH", 3, null),
      /* @__PURE__ */ _jsxQ("a", null, {
        href: "/admin/blogs",
        class: "term-dim hover:term-amber border border-[#1f2937] px-2 py-0.5 no-underline"
      }, "← BACK", 3, null)
    ], 3, null),
    ui.err && /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-red border border-[#ff4d4d] px-2 py-1"
    }, _fnSignal((p0) => p0.err, [
      ui
    ], "p0.err"), 3, "BT_0"),
    ui.msg && /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-green border border-[#00ff7f] px-2 py-1"
    }, _fnSignal((p0) => p0.msg, [
      ui
    ], "p0.msg"), 3, "BT_1"),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-panel p-3"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "term-cyan uppercase tracking-widest mb-2"
      }, "1. SOURCE MARKDOWN (paste original)", 3, null),
      /* @__PURE__ */ _jsxQ("textarea", null, {
        rows: 10,
        value: _fnSignal((p0) => p0.source_md, [
          form
        ], "p0.source_md"),
        placeholder: "Paste the source .md content here. The sanitizer will rewrite it in DevUtsav's voice while preserving facts, mantras and structure.",
        class: "w-full bg-black border border-[#1f2937] focus:border-[#ffb000] p-2 outline-none text-[#e6e6e6] font-mono text-xs",
        onInput$: /* @__PURE__ */ _noopQrl("s_3zo9S0fsj5Q", [
          form
        ])
      }, null, 3, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "flex items-center gap-2 mt-2"
      }, [
        /* @__PURE__ */ _jsxQ("button", null, {
          disabled: _fnSignal((p0) => p0.sanitizing, [
            ui
          ], "p0.sanitizing"),
          class: "term-amber border border-[#ffb000] px-3 py-1 hover:bg-[#1a1300] disabled:opacity-50",
          onClick$: sanitize
        }, _fnSignal((p0) => p0.sanitizing ? "REWRITING…" : "SANITIZE / REWRITE →", [
          ui
        ], 'p0.sanitizing?"REWRITING…":"SANITIZE / REWRITE →"'), 3, null),
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "term-dim text-[10px]"
        }, "uses Claude (Bedrock) — rewrites for originality, keeps facts/mantras intact", 3, null)
      ], 3, null)
    ], 3, null),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-panel p-3"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "term-cyan uppercase tracking-widest mb-2"
      }, "2. REWRITTEN MARKDOWN (review & edit)", 3, null),
      /* @__PURE__ */ _jsxQ("textarea", null, {
        rows: 16,
        value: _fnSignal((p0) => p0.content_md, [
          form
        ], "p0.content_md"),
        placeholder: "Sanitized output appears here. You can also write/paste a fresh post directly.",
        class: "w-full bg-black border border-[#1f2937] focus:border-[#ffb000] p-2 outline-none text-[#e6e6e6] font-mono text-xs",
        onInput$: /* @__PURE__ */ _noopQrl("s_P4Vnfdfp6vs", [
          form
        ])
      }, null, 3, null)
    ], 3, null),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-panel p-3 grid grid-cols-1 md:grid-cols-2 gap-2"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "md:col-span-2 flex items-center justify-between mb-1"
      }, [
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "term-cyan uppercase tracking-widest"
        }, "3. METADATA", 3, null),
        /* @__PURE__ */ _jsxQ("button", null, {
          disabled: _fnSignal((p0) => p0.seoing, [
            ui
          ], "p0.seoing"),
          class: "term-amber border border-[#ffb000] px-2 py-0.5 hover:bg-[#1a1300] disabled:opacity-50 text-[10px]",
          onClick$: autoSeo
        }, _fnSignal((p0) => p0.seoing ? "GENERATING…" : "✨ AUTO-SEO (AI)", [
          ui
        ], 'p0.seoing?"GENERATING…":"✨ AUTO-SEO (AI)"'), 3, null)
      ], 3, null),
      /* @__PURE__ */ _jsxC(Field, {
        label: "Title *",
        get value() {
          return form.title;
        },
        onInput$: /* @__PURE__ */ inlinedQrl(s_vVrAOsK7Lhk, "s_vVrAOsK7Lhk", [
          form
        ]),
        [_IMMUTABLE]: {
          label: _IMMUTABLE,
          value: _fnSignal((p0) => p0.title, [
            form
          ], "p0.title"),
          onInput$: _IMMUTABLE
        }
      }, 3, "BT_2"),
      /* @__PURE__ */ _jsxC(Field, {
        label: "Slug (optional)",
        get value() {
          return form.slug;
        },
        onInput$: /* @__PURE__ */ inlinedQrl(s_q4HU7TYgm6E, "s_q4HU7TYgm6E", [
          form
        ]),
        [_IMMUTABLE]: {
          label: _IMMUTABLE,
          value: _fnSignal((p0) => p0.slug, [
            form
          ], "p0.slug"),
          onInput$: _IMMUTABLE
        }
      }, 3, "BT_3"),
      /* @__PURE__ */ _jsxQ("div", null, null, [
        /* @__PURE__ */ _jsxQ("label", null, {
          class: "term-dim text-[10px] uppercase block mb-1"
        }, "Series", 3, null),
        /* @__PURE__ */ _jsxQ("select", null, {
          value: _fnSignal((p0) => p0.series_id, [
            form
          ], "p0.series_id"),
          class: "w-full bg-black border border-[#1f2937] px-2 py-1 text-[#e6e6e6]",
          onChange$: /* @__PURE__ */ _noopQrl("s_bUsTnf86QBI", [
            form
          ])
        }, [
          /* @__PURE__ */ _jsxQ("option", null, {
            value: ""
          }, "— none —", 3, null),
          seriesList.value.map((s) => /* @__PURE__ */ _jsxQ("option", {
            value: _wrapSignal(s, "_id")
          }, null, s.name, 1, s._id))
        ], 1, null)
      ], 1, null),
      /* @__PURE__ */ _jsxC(Field, {
        label: "Image URL",
        get value() {
          return form.image;
        },
        onInput$: /* @__PURE__ */ inlinedQrl(s_h0lhbQXh3Tc, "s_h0lhbQXh3Tc", [
          form
        ]),
        [_IMMUTABLE]: {
          label: _IMMUTABLE,
          value: _fnSignal((p0) => p0.image, [
            form
          ], "p0.image"),
          onInput$: _IMMUTABLE
        }
      }, 3, "BT_4"),
      /* @__PURE__ */ _jsxC(Field, {
        label: "Excerpt",
        get value() {
          return form.excerpt;
        },
        onInput$: /* @__PURE__ */ inlinedQrl(s_nJOvA0ChR0E, "s_nJOvA0ChR0E", [
          form
        ]),
        [_IMMUTABLE]: {
          label: _IMMUTABLE,
          value: _fnSignal((p0) => p0.excerpt, [
            form
          ], "p0.excerpt"),
          onInput$: _IMMUTABLE
        }
      }, 3, "BT_5"),
      /* @__PURE__ */ _jsxC(Field, {
        label: "OG image URL",
        get value() {
          return form.og_image;
        },
        onInput$: /* @__PURE__ */ inlinedQrl(s_va3EIDsc9ik, "s_va3EIDsc9ik", [
          form
        ]),
        [_IMMUTABLE]: {
          label: _IMMUTABLE,
          value: _fnSignal((p0) => p0.og_image, [
            form
          ], "p0.og_image"),
          onInput$: _IMMUTABLE
        }
      }, 3, "BT_6"),
      /* @__PURE__ */ _jsxC(Field, {
        label: "SEO title",
        get value() {
          return form.seo_title;
        },
        onInput$: /* @__PURE__ */ inlinedQrl(s_w6BVTY2t0GE, "s_w6BVTY2t0GE", [
          form
        ]),
        [_IMMUTABLE]: {
          label: _IMMUTABLE,
          value: _fnSignal((p0) => p0.seo_title, [
            form
          ], "p0.seo_title"),
          onInput$: _IMMUTABLE
        }
      }, 3, "BT_7"),
      /* @__PURE__ */ _jsxC(Field, {
        label: "SEO description",
        get value() {
          return form.seo_description;
        },
        onInput$: /* @__PURE__ */ inlinedQrl(s_oIi3Mu6By24, "s_oIi3Mu6By24", [
          form
        ]),
        [_IMMUTABLE]: {
          label: _IMMUTABLE,
          value: _fnSignal((p0) => p0.seo_description, [
            form
          ], "p0.seo_description"),
          onInput$: _IMMUTABLE
        }
      }, 3, "BT_8"),
      /* @__PURE__ */ _jsxQ("label", null, {
        class: "flex items-center gap-2 term-dim text-[10px] uppercase"
      }, [
        /* @__PURE__ */ _jsxQ("input", null, {
          type: "checkbox",
          checked: _fnSignal((p0) => p0.coming_soon, [
            form
          ], "p0.coming_soon"),
          onChange$: /* @__PURE__ */ _noopQrl("s_RzRAy8IkC20", [
            form
          ])
        }, null, 3, null),
        "Coming soon"
      ], 3, null)
    ], 1, null),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "flex items-center gap-2"
    }, [
      /* @__PURE__ */ _jsxQ("button", null, {
        disabled: _fnSignal((p0) => p0.saving, [
          ui
        ], "p0.saving"),
        class: "term-cyan border border-[#1f2937] hover:term-amber px-3 py-1 disabled:opacity-50",
        onClick$: /* @__PURE__ */ _noopQrl("s_hSz8VAATptg", [
          save
        ])
      }, _fnSignal((p0) => p0.saving ? "SAVING…" : "SAVE AS DRAFT", [
        ui
      ], 'p0.saving?"SAVING…":"SAVE AS DRAFT"'), 3, null),
      /* @__PURE__ */ _jsxQ("button", null, {
        disabled: _fnSignal((p0) => p0.saving, [
          ui
        ], "p0.saving"),
        class: "term-green border border-[#00ff7f] hover:bg-[#001a0d] px-3 py-1 disabled:opacity-50",
        onClick$: /* @__PURE__ */ _noopQrl("s_OySpBPSxbRA", [
          save
        ])
      }, _fnSignal((p0) => p0.saving ? "SAVING…" : "PUBLISH", [
        ui
      ], 'p0.saving?"SAVING…":"PUBLISH"'), 3, null)
    ], 3, null)
  ], 1, "BT_9");
};
const index$i = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_wXpG5PXTQ0Q, "s_wXpG5PXTQ0Q"));
const s_MpffBhkOKhc = (props) => /* @__PURE__ */ _jsxQ("div", null, null, [
  /* @__PURE__ */ _jsxQ("label", null, {
    class: "term-dim text-[10px] uppercase block mb-1"
  }, _fnSignal((p0) => p0.label, [
    props
  ], "p0.label"), 3, null),
  /* @__PURE__ */ _jsxQ("input", null, {
    value: _fnSignal((p0) => p0.value, [
      props
    ], "p0.value"),
    class: "w-full bg-black border border-[#1f2937] focus:border-[#ffb000] px-2 py-1 outline-none text-[#e6e6e6]",
    onInput$: /* @__PURE__ */ _noopQrl("s_OjJAYa9hH30", [
      props
    ])
  }, null, 3, null)
], 3, "BT_10");
const Field = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_MpffBhkOKhc, "s_MpffBhkOKhc"));
const AdminBlogsNewRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  _auto_Field: Field,
  default: index$i
}, Symbol.toStringTag, { value: "Module" }));
const s_vuLDwKrxH0U = async () => {
  const [store, tokenSig] = useLexicalScope();
  if (!tokenSig.value) return;
  store.loading = true;
  try {
    const res = await fetch(`${getApiBase()}/api/admin/blogs`, {
      headers: {
        Authorization: `Bearer ${tokenSig.value}`
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    store.blogs = await res.json();
    store.err = "";
  } catch (e) {
    store.err = String((e == null ? void 0 : e.message) || e);
  } finally {
    store.loading = false;
  }
};
const s_i8BnkVY11lI = async (id, title) => {
  const [fetchBlogs, store, tokenSig] = useLexicalScope();
  if (!confirm(`Delete "${title}"?`)) return;
  try {
    const res = await fetch(`${getApiBase()}/api/admin/blogs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tokenSig.value}`
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    store.msg = `Deleted ${title}`;
    await fetchBlogs();
  } catch (e) {
    store.err = String((e == null ? void 0 : e.message) || e);
  }
};
const s_yH4bITVYbzg = async () => {
  const [fetchBlogs, store, tokenSig] = useLexicalScope();
  const ids = Object.keys(store.selected).filter((k) => store.selected[k]);
  if (ids.length === 0) return;
  if (!confirm(`Delete ${ids.length} selected blog(s)? This cannot be undone.`)) return;
  let ok = 0, fail = 0;
  for (const id of ids) try {
    const res = await fetch(`${getApiBase()}/api/admin/blogs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tokenSig.value}`
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    ok++;
  } catch {
    fail++;
  }
  store.selected = {};
  store.msg = `Deleted ${ok} blog(s)${fail ? `, ${fail} failed` : ""}`;
  await fetchBlogs();
};
const s_UQkHxO0dfEU = async (b) => {
  const [fetchBlogs, store, tokenSig] = useLexicalScope();
  try {
    const next = b.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const res = await fetch(`${getApiBase()}/api/admin/blogs/${b._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenSig.value}`
      },
      body: JSON.stringify({
        status: next
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await fetchBlogs();
  } catch (e) {
    store.err = String((e == null ? void 0 : e.message) || e);
  }
};
const s_lGKmCNULKG8 = () => {
  const tokenSig = useSignal("");
  const filter = useStore({
    q: "",
    status: "ALL",
    series: ""
  });
  const store = useStore({
    blogs: [],
    loading: false,
    err: "",
    msg: "",
    selected: {}
  });
  const fetchBlogs = /* @__PURE__ */ inlinedQrl(s_vuLDwKrxH0U, "s_vuLDwKrxH0U", [
    store,
    tokenSig
  ]);
  useVisibleTaskQrl(/* @__PURE__ */ _noopQrl("s_vzlP5p820OE", [
    fetchBlogs,
    tokenSig
  ]));
  const del = /* @__PURE__ */ inlinedQrl(s_i8BnkVY11lI, "s_i8BnkVY11lI", [
    fetchBlogs,
    store,
    tokenSig
  ]);
  const bulkDelete = /* @__PURE__ */ inlinedQrl(s_yH4bITVYbzg, "s_yH4bITVYbzg", [
    fetchBlogs,
    store,
    tokenSig
  ]);
  const togglePublish = /* @__PURE__ */ inlinedQrl(s_UQkHxO0dfEU, "s_UQkHxO0dfEU", [
    fetchBlogs,
    store,
    tokenSig
  ]);
  const seriesOptions = () => {
    var _a;
    const map = /* @__PURE__ */ new Map();
    for (const b of store.blogs) if ((_a = b.series_id) == null ? void 0 : _a._id) map.set(b.series_id._id, b.series_id.name);
    return [
      ...map.entries()
    ];
  };
  const filtered = () => {
    const q = filter.q.trim().toLowerCase();
    return store.blogs.filter((b) => {
      var _a;
      if (filter.status !== "ALL" && b.status !== filter.status) return false;
      if (filter.series && ((_a = b.series_id) == null ? void 0 : _a._id) !== filter.series) return false;
      if (q && !`${b.title} ${b.slug} ${b.excerpt || ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  };
  return /* @__PURE__ */ _jsxQ("div", null, {
    class: "p-3 space-y-3"
  }, [
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "flex items-center justify-between"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "term-amber font-bold tracking-widest"
      }, "BLOGS // ALL", 3, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "flex gap-2"
      }, [
        Object.values(store.selected).some(Boolean) && /* @__PURE__ */ _jsxQ("button", null, {
          class: "term-red border border-[#ff4d4d] px-2 py-0.5 hover:bg-[#1a0000]",
          onClick$: bulkDelete
        }, [
          "DEL SELECTED (",
          _wrapSignal(Object.values(store.selected).filter(Boolean), "length"),
          ")"
        ], 1, "Jx_0"),
        /* @__PURE__ */ _jsxQ("a", null, {
          href: "/admin/blogs/bulk",
          class: "term-cyan hover:term-amber border border-[#1f2937] px-2 py-0.5 no-underline"
        }, "⇪ BULK MD", 3, null),
        /* @__PURE__ */ _jsxQ("a", null, {
          href: "/admin/blogs/new",
          class: "term-cyan hover:term-amber border border-[#1f2937] px-2 py-0.5 no-underline"
        }, "+ NEW BLOG", 3, null),
        /* @__PURE__ */ _jsxQ("button", null, {
          class: "term-cyan hover:term-amber border border-[#1f2937] px-2 py-0.5",
          onClick$: fetchBlogs
        }, "REFRESH", 3, null)
      ], 1, null)
    ], 1, null),
    store.err && /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-red border border-[#ff4d4d] px-2 py-1"
    }, _fnSignal((p0) => p0.err, [
      store
    ], "p0.err"), 3, "Jx_1"),
    store.msg && /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-green border border-[#00ff7f] px-2 py-1"
    }, _fnSignal((p0) => p0.msg, [
      store
    ], "p0.msg"), 3, "Jx_2"),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-panel p-2 grid grid-cols-1 md:grid-cols-3 gap-2"
    }, [
      /* @__PURE__ */ _jsxQ("input", null, {
        placeholder: "search title/slug/excerpt",
        value: _fnSignal((p0) => p0.q, [
          filter
        ], "p0.q"),
        class: "bg-black border border-[#1f2937] focus:border-[#ffb000] px-2 py-1 outline-none text-[#e6e6e6]",
        onInput$: /* @__PURE__ */ _noopQrl("s_tmgyrOPZcdY", [
          filter
        ])
      }, null, 3, null),
      /* @__PURE__ */ _jsxQ("select", null, {
        value: _fnSignal((p0) => p0.status, [
          filter
        ], "p0.status"),
        class: "bg-black border border-[#1f2937] px-2 py-1 text-[#e6e6e6]",
        onChange$: /* @__PURE__ */ _noopQrl("s_tj06Zg2GF3k", [
          filter
        ])
      }, [
        /* @__PURE__ */ _jsxQ("option", null, {
          value: "ALL"
        }, "All statuses", 3, null),
        /* @__PURE__ */ _jsxQ("option", null, {
          value: "DRAFT"
        }, "Draft only", 3, null),
        /* @__PURE__ */ _jsxQ("option", null, {
          value: "PUBLISHED"
        }, "Published only", 3, null)
      ], 3, null),
      /* @__PURE__ */ _jsxQ("select", null, {
        value: _fnSignal((p0) => p0.series, [
          filter
        ], "p0.series"),
        class: "bg-black border border-[#1f2937] px-2 py-1 text-[#e6e6e6]",
        onChange$: /* @__PURE__ */ _noopQrl("s_PhJyt9KT1Yc", [
          filter
        ])
      }, [
        /* @__PURE__ */ _jsxQ("option", null, {
          value: ""
        }, "All categories", 3, null),
        seriesOptions().map(([id, name]) => /* @__PURE__ */ _jsxQ("option", {
          value: id
        }, null, name, 1, id))
      ], 1, null)
    ], 1, null),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "overflow-x-auto"
    }, /* @__PURE__ */ _jsxQ("table", null, {
      class: "w-full"
    }, [
      /* @__PURE__ */ _jsxQ("thead", null, null, /* @__PURE__ */ _jsxQ("tr", null, {
        class: "term-dim text-[10px] uppercase"
      }, [
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-left py-1 w-6"
        }, /* @__PURE__ */ _jsxQ("input", {
          checked: filtered().length > 0 && filtered().every((b) => store.selected[b._id]),
          onChange$: /* @__PURE__ */ _noopQrl("s_CkMh9HxY6T8", [
            filtered,
            store
          ])
        }, {
          type: "checkbox",
          "aria-label": "Select all"
        }, null, 2, null), 1, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-left py-1"
        }, "TITLE", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-left"
        }, "SLUG", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-left"
        }, "CATEGORY", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-left"
        }, "STATUS", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-left"
        }, "UPDATED", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-right"
        }, "ACTIONS", 3, null)
      ], 1, null), 1, null),
      /* @__PURE__ */ _jsxQ("tbody", null, null, [
        !store.loading && filtered().length === 0 && /* @__PURE__ */ _jsxQ("tr", null, null, /* @__PURE__ */ _jsxQ("td", null, {
          colSpan: 7,
          class: "term-dim py-4"
        }, "no blogs match", 3, null), 3, "Jx_3"),
        filtered().map((b) => {
          var _a;
          return /* @__PURE__ */ _jsxQ("tr", null, {
            class: "term-row border-t border-[#111827]"
          }, [
            /* @__PURE__ */ _jsxQ("td", null, {
              class: "py-1.5"
            }, /* @__PURE__ */ _jsxQ("input", {
              "aria-label": `Select ${b.title}`,
              checked: !!store.selected[b._id],
              onChange$: /* @__PURE__ */ _noopQrl("s_JWwiMynG8ic", [
                b,
                store
              ])
            }, {
              type: "checkbox"
            }, null, 2, null), 1, null),
            /* @__PURE__ */ _jsxQ("td", null, {
              class: "py-1.5 term-amber"
            }, _wrapSignal(b, "title"), 1, null),
            /* @__PURE__ */ _jsxQ("td", null, {
              class: "term-cyan"
            }, _wrapSignal(b, "slug"), 1, null),
            /* @__PURE__ */ _jsxQ("td", null, {
              class: "term-dim"
            }, ((_a = b.series_id) == null ? void 0 : _a.name) || "—", 1, null),
            /* @__PURE__ */ _jsxQ("td", {
              class: b.status === "PUBLISHED" ? "term-green" : "term-dim"
            }, null, _wrapSignal(b, "status"), 1, null),
            /* @__PURE__ */ _jsxQ("td", null, {
              class: "term-dim"
            }, fmtDate(b.updatedAt), 1, null),
            /* @__PURE__ */ _jsxQ("td", null, {
              class: "text-right"
            }, /* @__PURE__ */ _jsxQ("div", null, {
              class: "inline-flex gap-1"
            }, [
              /* @__PURE__ */ _jsxQ("a", {
                href: `/blog/${b.slug}`
              }, {
                target: "_blank",
                class: "term-cyan border border-[#1f2937] px-2 py-0.5 no-underline text-[10px] hover:term-amber"
              }, "VIEW", 3, null),
              /* @__PURE__ */ _jsxQ("button", {
                onClick$: /* @__PURE__ */ _noopQrl("s_CkCOA90uNp8", [
                  b,
                  togglePublish
                ])
              }, {
                class: "term-amber border border-[#1f2937] px-2 py-0.5 text-[10px] hover:bg-[#1a1300]"
              }, b.status === "PUBLISHED" ? "UNPUBLISH" : "PUBLISH", 0, null),
              /* @__PURE__ */ _jsxQ("button", {
                onClick$: /* @__PURE__ */ _noopQrl("s_IGpKMFMTQjk", [
                  b,
                  del
                ])
              }, {
                class: "term-red border border-[#1f2937] px-2 py-0.5 text-[10px] hover:bg-[#1a0000]"
              }, "DEL", 2, null)
            ], 1, null), 1, null)
          ], 1, b._id);
        })
      ], 1, null)
    ], 1, null), 1, null),
    /* @__PURE__ */ _jsxQ("p", null, {
      class: "term-dim text-[10px]"
    }, [
      "Showing ",
      _wrapSignal(filtered(), "length"),
      " of ",
      _fnSignal((p0) => p0.blogs.length, [
        store
      ], "p0.blogs.length"),
      " blogs. Top-performing blogs (7d analytics) live on the OVERVIEW tab."
    ], 1, null)
  ], 1, "Jx_4");
};
const index$h = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_lGKmCNULKG8, "s_lGKmCNULKG8"));
const AdminBlogsRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index$h
}, Symbol.toStringTag, { value: "Module" }));
const s_ARlRBwPwGlU = () => {
  const store = useContext(PulseCtx);
  if (!store.pulse) return /* @__PURE__ */ _jsxQ("div", null, {
    class: "p-8 term-dim"
  }, "loading…", 3, "bZ_0");
  return /* @__PURE__ */ _jsxQ("div", null, {
    class: "p-3"
  }, [
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-amber font-bold tracking-widest mb-2"
    }, "EVENT STREAM // LAST 50", 3, null),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "overflow-x-auto"
    }, /* @__PURE__ */ _jsxQ("table", null, {
      class: "w-full"
    }, [
      /* @__PURE__ */ _jsxQ("thead", null, null, /* @__PURE__ */ _jsxQ("tr", null, {
        class: "term-dim text-[10px] uppercase"
      }, [
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-left py-1 w-20"
        }, "TIME", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-left w-32"
        }, "TYPE", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-left"
        }, "PATH / SECTION", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-right w-24"
        }, "SCROLL", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-right w-24"
        }, "DUR", 3, null)
      ], 3, null), 3, null),
      /* @__PURE__ */ _jsxQ("tbody", null, null, [
        store.pulse.recent_events.length === 0 && /* @__PURE__ */ _jsxQ("tr", null, null, /* @__PURE__ */ _jsxQ("td", null, {
          colSpan: 5,
          class: "term-dim py-4"
        }, "no events yet", 3, null), 3, "bZ_1"),
        store.pulse.recent_events.map((e, i) => /* @__PURE__ */ _jsxQ("tr", null, {
          class: "term-row border-t border-[#111827]"
        }, [
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "py-1.5 term-dim tabular-nums"
          }, fmtTime(e.ts), 1, null),
          /* @__PURE__ */ _jsxQ("td", {
            class: `${e.type === "error" ? "term-red" : e.type.startsWith("section") ? "term-green" : "term-cyan"}`
          }, null, _wrapSignal(e, "type"), 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "truncate max-w-[420px]"
          }, [
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "term-amber"
            }, e.path || "", 1, null),
            e.section_id && /* @__PURE__ */ _jsxQ("span", null, {
              class: "term-dim"
            }, [
              " · ",
              _wrapSignal(e, "section_id")
            ], 1, "bZ_2"),
            e.blog_slug && /* @__PURE__ */ _jsxQ("span", null, {
              class: "term-dim"
            }, [
              " · ",
              _wrapSignal(e, "blog_slug")
            ], 1, "bZ_3")
          ], 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "text-right tabular-nums"
          }, pct(e.scroll_pct), 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "text-right tabular-nums"
          }, dur(e.duration_ms), 1, null)
        ], 1, i))
      ], 1, null)
    ], 1, null), 1, null)
  ], 1, "bZ_4");
};
const index$g = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_ARlRBwPwGlU, "s_ARlRBwPwGlU"));
const AdminEventsRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index$g
}, Symbol.toStringTag, { value: "Module" }));
const fmtSize = (n) => n > 1048576 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
const s_b8R8wbd2voY = async () => {
  const [store, tokenSig] = useLexicalScope();
  if (!tokenSig.value) return;
  store.loading = true;
  try {
    const res = await fetch(`${getApiBase()}/api/admin/images`, {
      headers: {
        Authorization: `Bearer ${tokenSig.value}`
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    store.images = data.images || [];
  } catch (e) {
    store.err = String((e == null ? void 0 : e.message) || e);
  } finally {
    store.loading = false;
  }
};
const s_kxiw3YS3Goc = async () => {
  var _a;
  const [fetchImages, store, tokenSig] = useLexicalScope();
  const files = store.pending;
  if (!files || !files.length) {
    store.err = "pick files first";
    return;
  }
  store.err = "";
  store.msg = "";
  store.uploading = true;
  try {
    const fd = new FormData();
    for (const f of files) fd.append("files", f);
    const res = await fetch(`${getApiBase()}/api/admin/images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenSig.value}`
      },
      body: fd
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    store.msg = `Uploaded ${((_a = data.uploaded) == null ? void 0 : _a.length) || 0} image(s).`;
    store.pending = void 0;
    await fetchImages();
  } catch (e) {
    store.err = String((e == null ? void 0 : e.message) || e);
  } finally {
    store.uploading = false;
  }
};
const s_R4lKl0Zh1ro = async (name) => {
  const [fetchImages, store, tokenSig] = useLexicalScope();
  if (!confirm(`Delete ${name}?`)) return;
  try {
    const res = await fetch(`${getApiBase()}/api/admin/images/${encodeURIComponent(name)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tokenSig.value}`
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await fetchImages();
  } catch (e) {
    store.err = String((e == null ? void 0 : e.message) || e);
  }
};
const s_DgoldDktDOE = async (img) => {
  const [store] = useLexicalScope();
  const base = getApiBase();
  const full = base ? `${base}${img.url}` : img.url;
  try {
    await navigator.clipboard.writeText(full);
    store.msg = `Copied: ${full}`;
  } catch {
    store.err = "Copy failed — select & copy manually";
  }
};
const s_U0CvYXGkFZk = () => {
  const tokenSig = useSignal("");
  const store = useStore({
    images: [],
    loading: false,
    uploading: false,
    err: "",
    msg: "",
    pending: void 0
  });
  const fetchImages = /* @__PURE__ */ inlinedQrl(s_b8R8wbd2voY, "s_b8R8wbd2voY", [
    store,
    tokenSig
  ]);
  useVisibleTaskQrl(/* @__PURE__ */ _noopQrl("s_3Q9HAoM20WA", [
    fetchImages,
    tokenSig
  ]));
  const upload = /* @__PURE__ */ inlinedQrl(s_kxiw3YS3Goc, "s_kxiw3YS3Goc", [
    fetchImages,
    store,
    tokenSig
  ]);
  const del = /* @__PURE__ */ inlinedQrl(s_R4lKl0Zh1ro, "s_R4lKl0Zh1ro", [
    fetchImages,
    store,
    tokenSig
  ]);
  const copyUrl = /* @__PURE__ */ inlinedQrl(s_DgoldDktDOE, "s_DgoldDktDOE", [
    store
  ]);
  return /* @__PURE__ */ _jsxQ("div", null, {
    class: "p-3 space-y-3"
  }, [
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "flex items-center justify-between"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "term-amber font-bold tracking-widest"
      }, [
        "IMAGE LIBRARY // ",
        _fnSignal((p0) => p0.images.length, [
          store
        ], "p0.images.length")
      ], 3, null),
      /* @__PURE__ */ _jsxQ("button", null, {
        class: "term-cyan border border-[#1f2937] px-2 py-0.5 hover:term-amber",
        onClick$: fetchImages
      }, "REFRESH", 3, null)
    ], 3, null),
    store.err && /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-red border border-[#ff4d4d] px-2 py-1"
    }, _fnSignal((p0) => p0.err, [
      store
    ], "p0.err"), 3, "qY_0"),
    store.msg && /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-green border border-[#00ff7f] px-2 py-1"
    }, _fnSignal((p0) => p0.msg, [
      store
    ], "p0.msg"), 3, "qY_1"),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-panel p-3"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "term-cyan uppercase tracking-widest mb-2"
      }, "UPLOAD (multi-select)", 3, null),
      /* @__PURE__ */ _jsxQ("input", null, {
        type: "file",
        multiple: true,
        accept: "image/*",
        class: "block text-xs",
        onChange$: /* @__PURE__ */ _noopQrl("s_wNtgzkIChWU", [
          store
        ])
      }, null, 3, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "flex items-center gap-2 mt-2"
      }, [
        /* @__PURE__ */ _jsxQ("button", null, {
          disabled: _fnSignal((p0) => p0.uploading, [
            store
          ], "p0.uploading"),
          class: "term-amber border border-[#ffb000] px-3 py-1 hover:bg-[#1a1300] disabled:opacity-50",
          onClick$: upload
        }, _fnSignal((p0) => p0.uploading ? "UPLOADING…" : "UPLOAD", [
          store
        ], 'p0.uploading?"UPLOADING…":"UPLOAD"'), 3, null),
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "term-dim text-[10px]"
        }, "max 8 MB each, up to 20 files; saved to /public/uploads/blogs/", 3, null)
      ], 3, null)
    ], 3, null),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
    }, [
      store.images.map((img) => /* @__PURE__ */ _jsxQ("div", null, {
        class: "term-panel p-2 flex flex-col gap-1"
      }, [
        /* @__PURE__ */ _jsxQ("img", {
          src: `${getApiBase()}${img.url}`,
          alt: _wrapSignal(img, "name")
        }, {
          class: "w-full h-28 object-cover bg-black border border-[#1f2937]"
        }, null, 3, null),
        /* @__PURE__ */ _jsxQ("div", {
          title: _wrapSignal(img, "name")
        }, {
          class: "truncate text-[10px] term-dim"
        }, _wrapSignal(img, "name"), 1, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "text-[10px] term-dim"
        }, fmtSize(img.size), 1, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "flex gap-1"
        }, [
          /* @__PURE__ */ _jsxQ("button", {
            onClick$: /* @__PURE__ */ _noopQrl("s_b6XxoGCzYzo", [
              copyUrl,
              img
            ])
          }, {
            class: "flex-1 term-cyan border border-[#1f2937] px-1 py-0.5 text-[10px] hover:term-amber"
          }, "COPY URL", 2, null),
          /* @__PURE__ */ _jsxQ("button", {
            onClick$: /* @__PURE__ */ _noopQrl("s_PjliHblfvqs", [
              del,
              img
            ])
          }, {
            class: "term-red border border-[#1f2937] px-1 py-0.5 text-[10px] hover:bg-[#1a0000]"
          }, "DEL", 2, null)
        ], 1, null)
      ], 1, img.name)),
      !store.loading && store.images.length === 0 && /* @__PURE__ */ _jsxQ("div", null, {
        class: "term-dim col-span-full py-8 text-center"
      }, "no images yet", 3, "qY_2")
    ], 1, null)
  ], 1, "qY_3");
};
const index$f = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_U0CvYXGkFZk, "s_U0CvYXGkFZk"));
const AdminImagesRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  _auto_fmtSize: fmtSize,
  default: index$f
}, Symbol.toStringTag, { value: "Module" }));
const s_Ea30dGkIUoM = () => {
  const store = useContext(PulseCtx);
  if (!store.pulse) return /* @__PURE__ */ _jsxQ("div", null, {
    class: "p-8 term-dim"
  }, "loading…", 3, "SM_0");
  return /* @__PURE__ */ _jsxQ("div", null, {
    class: "p-3"
  }, [
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-amber font-bold tracking-widest mb-2"
    }, "TOP PAGES // 24H", 3, null),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "overflow-x-auto"
    }, /* @__PURE__ */ _jsxQ("table", null, {
      class: "w-full"
    }, [
      /* @__PURE__ */ _jsxQ("thead", null, null, /* @__PURE__ */ _jsxQ("tr", null, {
        class: "term-dim text-[10px] uppercase"
      }, [
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-left py-1"
        }, "PATH", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-right"
        }, "VIEWS", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-right"
        }, "UNIQUE", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-right"
        }, "AVG SCROLL", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-right"
        }, "AVG TIME", 3, null)
      ], 3, null), 3, null),
      /* @__PURE__ */ _jsxQ("tbody", null, null, [
        store.pulse.pages.length === 0 && /* @__PURE__ */ _jsxQ("tr", null, null, /* @__PURE__ */ _jsxQ("td", null, {
          colSpan: 5,
          class: "term-dim py-4"
        }, "no data yet — waiting for traffic", 3, null), 3, "SM_1"),
        store.pulse.pages.map((row) => /* @__PURE__ */ _jsxQ("tr", null, {
          class: "term-row border-t border-[#111827]"
        }, [
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "py-2 term-cyan"
          }, _wrapSignal(row, "path"), 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "text-right tabular-nums term-amber"
          }, _wrapSignal(row, "views"), 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "text-right tabular-nums"
          }, _wrapSignal(row, "sessions"), 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "text-right tabular-nums"
          }, pct(row.avg_scroll), 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "text-right tabular-nums"
          }, dur(row.avg_time_ms), 1, null)
        ], 1, row.path))
      ], 1, null)
    ], 1, null), 1, null)
  ], 1, "SM_2");
};
const index$e = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_Ea30dGkIUoM, "s_Ea30dGkIUoM"));
const AdminPagesRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index$e
}, Symbol.toStringTag, { value: "Module" }));
const s_0DnKzQ09eew = () => {
  const store = useContext(PulseCtx);
  if (!store.pulse) return /* @__PURE__ */ _jsxQ("div", null, {
    class: "p-8 term-dim"
  }, "loading…", 3, "nI_0");
  return /* @__PURE__ */ _jsxQ("div", null, {
    class: "p-3 space-y-6"
  }, [
    /* @__PURE__ */ _jsxQ("div", null, null, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "term-amber font-bold tracking-widest mb-2"
      }, "SCHEDULER HEALTH", 3, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "overflow-x-auto"
      }, /* @__PURE__ */ _jsxQ("table", null, {
        class: "w-full"
      }, [
        /* @__PURE__ */ _jsxQ("thead", null, null, /* @__PURE__ */ _jsxQ("tr", null, {
          class: "term-dim text-[10px] uppercase"
        }, [
          /* @__PURE__ */ _jsxQ("th", null, {
            class: "text-left py-1"
          }, "JOB", 3, null),
          /* @__PURE__ */ _jsxQ("th", null, {
            class: "text-left"
          }, "CRON", 3, null),
          /* @__PURE__ */ _jsxQ("th", null, {
            class: "text-right"
          }, "NEXT IN", 3, null),
          /* @__PURE__ */ _jsxQ("th", null, {
            class: "text-right"
          }, "LAST", 3, null),
          /* @__PURE__ */ _jsxQ("th", null, {
            class: "text-right"
          }, "STATUS", 3, null),
          /* @__PURE__ */ _jsxQ("th", null, {
            class: "text-right"
          }, "DUR", 3, null),
          /* @__PURE__ */ _jsxQ("th", null, {
            class: "text-right"
          }, "7D OK/ERR", 3, null),
          /* @__PURE__ */ _jsxQ("th", null, {
            class: "text-right"
          }, "AVG", 3, null)
        ], 3, null), 3, null),
        /* @__PURE__ */ _jsxQ("tbody", null, null, store.pulse.scheduler.map((s) => /* @__PURE__ */ _jsxQ("tr", null, {
          class: "term-row border-t border-[#111827]"
        }, [
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "py-2 term-cyan"
          }, _wrapSignal(s, "label"), 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "term-dim"
          }, _wrapSignal(s, "cron"), 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "text-right tabular-nums term-amber"
          }, countdown(s.next_run_at), 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "text-right term-dim"
          }, fmtDate(s.last_run_at), 1, null),
          /* @__PURE__ */ _jsxQ("td", {
            class: `text-right ${s.last_status === "success" ? "term-green" : s.last_status === "error" ? "term-red" : "term-dim"}`
          }, null, (s.last_status || "—").toUpperCase(), 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "text-right tabular-nums"
          }, dur(s.last_duration_ms), 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "text-right tabular-nums"
          }, [
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "term-green"
            }, _wrapSignal(s, "success_7d"), 1, null),
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "term-dim"
            }, "/", 3, null),
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "term-red"
            }, _wrapSignal(s, "error_7d"), 1, null)
          ], 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "text-right tabular-nums"
          }, ms(s.avg_ms_7d), 1, null)
        ], 1, s.job)), 1, null)
      ], 1, null), 1, null)
    ], 1, null),
    store.pulse.prompt_schedules.length > 0 && /* @__PURE__ */ _jsxQ("div", null, null, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "term-amber font-bold tracking-widest mb-2"
      }, "USER-DEFINED PROMPT SCHEDULES", 3, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "overflow-x-auto"
      }, /* @__PURE__ */ _jsxQ("table", null, {
        class: "w-full"
      }, [
        /* @__PURE__ */ _jsxQ("thead", null, null, /* @__PURE__ */ _jsxQ("tr", null, {
          class: "term-dim text-[10px] uppercase"
        }, [
          /* @__PURE__ */ _jsxQ("th", null, {
            class: "text-left py-1"
          }, "PROMPT", 3, null),
          /* @__PURE__ */ _jsxQ("th", null, {
            class: "text-left"
          }, "CRON", 3, null),
          /* @__PURE__ */ _jsxQ("th", null, {
            class: "text-right"
          }, "ACTIVE", 3, null),
          /* @__PURE__ */ _jsxQ("th", null, {
            class: "text-right"
          }, "NEXT IN", 3, null),
          /* @__PURE__ */ _jsxQ("th", null, {
            class: "text-right"
          }, "LAST", 3, null),
          /* @__PURE__ */ _jsxQ("th", null, {
            class: "text-right"
          }, "STATUS", 3, null)
        ], 3, null), 3, null),
        /* @__PURE__ */ _jsxQ("tbody", null, null, store.pulse.prompt_schedules.map((s) => /* @__PURE__ */ _jsxQ("tr", null, {
          class: "term-row border-t border-[#111827]"
        }, [
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "py-2 truncate max-w-[260px] term-cyan"
          }, _wrapSignal(s, "prompt"), 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "term-dim"
          }, _wrapSignal(s, "cron"), 1, null),
          /* @__PURE__ */ _jsxQ("td", {
            class: `text-right ${s.active ? "term-green" : "term-dim"}`
          }, null, s.active ? "YES" : "NO", 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "text-right tabular-nums term-amber"
          }, s.active ? countdown(s.next_run_at) : "—", 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "text-right term-dim"
          }, fmtDate(s.last_run_at), 1, null),
          /* @__PURE__ */ _jsxQ("td", {
            class: `text-right ${s.last_status === "success" ? "term-green" : s.last_status === "error" ? "term-red" : "term-dim"}`
          }, null, (s.last_status || "—").toUpperCase(), 1, null)
        ], 1, s._id)), 1, null)
      ], 1, null), 1, null)
    ], 1, "nI_1")
  ], 1, "nI_2");
};
const index$d = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_0DnKzQ09eew, "s_0DnKzQ09eew"));
const AdminSchedulerRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index$d
}, Symbol.toStringTag, { value: "Module" }));
function shortBrowser(ua) {
  if (!ua) return "";
  if (/iPhone|iPad/.test(ua)) return "iOS Safari";
  if (/Android/.test(ua)) return "Android";
  if (/Edg\//.test(ua)) return "Edge";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua)) return "Safari";
  return ua.slice(0, 24);
}
const s_HPIXJMOiV8o = async () => {
  const [store, tokenSig] = useLexicalScope();
  if (!tokenSig.value) return;
  store.loading = true;
  try {
    const res = await fetch(`${getApiBase()}/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${tokenSig.value}`
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    store.users = data.users || [];
    store.total = data.total || 0;
    store.err = "";
  } catch (e) {
    store.err = String((e == null ? void 0 : e.message) || e);
  } finally {
    store.loading = false;
  }
};
const s_Qf8YWLHkSr4 = () => {
  const store = useStore({
    users: [],
    total: 0,
    loading: false,
    err: ""
  });
  const tokenSig = useSignal("");
  const fetchUsers = /* @__PURE__ */ inlinedQrl(s_HPIXJMOiV8o, "s_HPIXJMOiV8o", [
    store,
    tokenSig
  ]);
  useVisibleTaskQrl(/* @__PURE__ */ _noopQrl("s_VjT7OXLenfg", [
    fetchUsers,
    tokenSig
  ]));
  return /* @__PURE__ */ _jsxQ("div", null, {
    class: "p-3"
  }, [
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "flex items-center justify-between mb-2"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "term-amber font-bold tracking-widest"
      }, [
        "USERS // ",
        _fnSignal((p0) => p0.total, [
          store
        ], "p0.total")
      ], 3, null),
      /* @__PURE__ */ _jsxQ("button", null, {
        class: "term-cyan hover:term-amber border border-[#1f2937] px-2 py-0.5",
        onClick$: /* @__PURE__ */ _noopQrl("s_1BNqUd45A3Y", [
          fetchUsers
        ])
      }, "REFRESH", 3, null)
    ], 3, null),
    store.err && /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-red mb-2"
    }, _fnSignal((p0) => p0.err, [
      store
    ], "p0.err"), 3, "0a_0"),
    store.loading && /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-dim"
    }, "loading…", 3, "0a_1"),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "overflow-x-auto"
    }, /* @__PURE__ */ _jsxQ("table", null, {
      class: "w-full"
    }, [
      /* @__PURE__ */ _jsxQ("thead", null, null, /* @__PURE__ */ _jsxQ("tr", null, {
        class: "term-dim text-[10px] uppercase"
      }, [
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-left py-1"
        }, "NAME", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-left"
        }, "PHONE", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-left"
        }, "EMAIL", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-left"
        }, "SOURCE", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-left"
        }, "FIRST LANDING", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-left"
        }, "DEVICE", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-left"
        }, "LOCATION", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-right"
        }, "SESS", 3, null),
        /* @__PURE__ */ _jsxQ("th", null, {
          class: "text-left"
        }, "CREATED", 3, null)
      ], 3, null), 3, null),
      /* @__PURE__ */ _jsxQ("tbody", null, null, [
        !store.loading && store.users.length === 0 && /* @__PURE__ */ _jsxQ("tr", null, null, /* @__PURE__ */ _jsxQ("td", null, {
          colSpan: 9,
          class: "term-dim py-4"
        }, "no users", 3, null), 3, "0a_2"),
        store.users.map((u) => /* @__PURE__ */ _jsxQ("tr", null, {
          class: "term-row border-t border-[#111827]"
        }, [
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "py-1.5 term-amber"
          }, u.name || /* @__PURE__ */ _jsxQ("span", null, {
            class: "term-dim"
          }, "—", 3, "0a_3"), 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "term-cyan tabular-nums"
          }, u.phone || /* @__PURE__ */ _jsxQ("span", null, {
            class: "term-dim"
          }, "—", 3, "0a_4"), 1, null),
          /* @__PURE__ */ _jsxQ("td", null, null, u.email || /* @__PURE__ */ _jsxQ("span", null, {
            class: "term-dim"
          }, "—", 3, "0a_5"), 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "term-amber font-bold"
          }, u.source || /* @__PURE__ */ _jsxQ("span", null, {
            class: "term-dim"
          }, "—", 3, "0a_6"), 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "term-green"
          }, u.first_landing_url || /* @__PURE__ */ _jsxQ("span", null, {
            class: "term-dim"
          }, "—", 3, "0a_7"), 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "term-dim"
          }, shortBrowser(u.browser_details) || "—", 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "term-dim"
          }, u.location || "—", 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "text-right tabular-nums"
          }, u.sessions ?? "—", 1, null),
          /* @__PURE__ */ _jsxQ("td", null, {
            class: "term-dim"
          }, u.createdAt ? fmtDate(u.createdAt) : "—", 1, null)
        ], 1, u._id))
      ], 1, null)
    ], 1, null), 1, null),
    /* @__PURE__ */ _jsxQ("p", null, {
      class: "term-dim mt-3 text-[10px]"
    }, [
      "SOURCE = codename of the form that captured the user. Known codenames:",
      /* @__PURE__ */ _jsxQ("span", null, {
        class: "term-amber"
      }, " DOSHA_ANALYZER", 3, null),
      " (analyzer page form). Older records without a stored source fall back to ",
      /* @__PURE__ */ _jsxQ("span", null, {
        class: "term-dim"
      }, "URL:<first landing>", 3, null),
      " or ",
      /* @__PURE__ */ _jsxQ("span", null, {
        class: "term-dim"
      }, "UNKNOWN", 3, null),
      "."
    ], 3, null)
  ], 1, "0a_8");
};
const index$c = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_Qf8YWLHkSr4, "s_Qf8YWLHkSr4"));
const AdminUsersRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  _auto_shortBrowser: shortBrowser,
  default: index$c
}, Symbol.toStringTag, { value: "Module" }));
const s_PHwLBHheO1Q = (props) => {
  const soon = !!props.post.coming_soon || !!props.seriesComingSoon;
  return /* @__PURE__ */ _jsxC(Link, {
    get href() {
      return `/blog/${props.post.slug}`;
    },
    class: `group bg-surface-container-low border border-outline-variant/30 rounded-3xl overflow-hidden hover:-translate-y-1 transition-transform hover:shadow-lg hover:shadow-primary/5 flex flex-col ${soon ? "ring-1 ring-amber-500/25" : ""}`,
    children: [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "p-6 flex-1 flex flex-col items-start"
      }, [
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "flex flex-wrap gap-2 mb-3"
        }, [
          /* @__PURE__ */ _jsxQ("span", null, {
            class: "bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
          }, _fnSignal((p0) => p0.categoryLabel, [
            props
          ], "p0.categoryLabel"), 3, null),
          soon ? /* @__PURE__ */ _jsxQ("span", null, {
            class: "bg-amber-500/95 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
          }, "Coming soon", 3, "vF_0") : null
        ], 1, null),
        /* @__PURE__ */ _jsxQ("h3", null, {
          class: "font-headline text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors leading-tight line-clamp-2"
        }, _fnSignal((p0) => p0.post.title, [
          props
        ], "p0.post.title"), 3, null),
        /* @__PURE__ */ _jsxQ("p", null, {
          class: "text-on-surface-variant text-sm line-clamp-3 mt-auto"
        }, _fnSignal((p0) => p0.post.excerpt || "Read the full article.", [
          props
        ], 'p0.post.excerpt||"Read the full article."'), 3, null)
      ], 1, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "bg-surface-container/30 px-6 py-4 flex items-center justify-between border-t border-outline-variant/10 text-primary"
      }, [
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "text-sm font-bold tracking-wider uppercase"
        }, soon ? "Preview" : "Read article", 1, null),
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "material-symbols-outlined text-sm transition-transform group-hover:translate-x-2"
        }, "arrow_forward", 3, null)
      ], 1, null)
    ],
    [_IMMUTABLE]: {
      href: _fnSignal((p0) => `/blog/${p0.post.slug}`, [
        props
      ], "`/blog/${p0.post.slug}`")
    }
  }, 1, "vF_1");
};
const BlogPostCard = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_PHwLBHheO1Q, "s_PHwLBHheO1Q"));
const PAGE_SIZE = 12;
const s_Med0NZjYFGg = async ({ url }) => {
  var _a;
  const base = getApiBase();
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const series = (url.searchParams.get("series") || "").trim();
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("limit", String(PAGE_SIZE));
  if (series) qs.set("series_slug", series);
  try {
    const res = await fetch(`${base}/api/blogs/posts?${qs.toString()}`);
    if (!res.ok) return {
      apiOk: false,
      posts: [],
      total: 0,
      page: 1,
      totalPages: 0,
      series,
      seriesTitle: null
    };
    const data = await res.json();
    let seriesTitle = null;
    if (series) {
      const sRes = await fetch(`${base}/api/blogs/series`);
      if (sRes.ok) {
        const sData = await sRes.json();
        const found = (_a = sData.series) == null ? void 0 : _a.find((x) => x.slug === series);
        seriesTitle = (found == null ? void 0 : found.name) || null;
      }
    }
    return {
      apiOk: true,
      posts: data.posts || [],
      total: data.total ?? 0,
      page: data.page ?? page,
      totalPages: data.totalPages ?? 0,
      series,
      seriesTitle
    };
  } catch {
    return {
      apiOk: false,
      posts: [],
      total: 0,
      page: 1,
      totalPages: 0,
      series,
      seriesTitle: null
    };
  }
};
const useArticlesPage = routeLoaderQrl(/* @__PURE__ */ inlinedQrl(s_Med0NZjYFGg, "s_Med0NZjYFGg"));
const s_uv1RswuXCss = () => {
  const state = useArticlesPage();
  const buildHref = (p) => {
    const qs = new URLSearchParams();
    if (p > 1) qs.set("page", String(p));
    if (state.value.series) qs.set("series", state.value.series);
    const q = qs.toString();
    return q ? `/blog/articles?${q}` : "/blog/articles";
  };
  return /* @__PURE__ */ _jsxQ("main", null, {
    class: "px-4 md:px-0 max-w-5xl mx-auto relative pt-6 min-h-screen pb-24"
  }, [
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "px-6 mb-8"
    }, [
      /* @__PURE__ */ _jsxC(Link, {
        href: "/blog",
        class: "inline-flex items-center text-primary text-sm font-bold uppercase tracking-widest hover:underline mb-6",
        children: [
          /* @__PURE__ */ _jsxQ("span", null, {
            class: "material-symbols-outlined text-sm mr-2"
          }, "arrow_back", 3, null),
          "Knowledge hub"
        ],
        [_IMMUTABLE]: {
          href: _IMMUTABLE,
          class: _IMMUTABLE
        }
      }, 3, "WD_0"),
      /* @__PURE__ */ _jsxQ("h1", null, {
        class: "font-headline text-3xl md:text-4xl font-bold text-on-surface"
      }, _fnSignal((p0) => p0.value.series ? p0.value.seriesTitle || "Articles" : "All articles", [
        state
      ], 'p0.value.series?p0.value.seriesTitle||"Articles":"All articles"'), 3, null),
      /* @__PURE__ */ _jsxQ("p", null, {
        class: "text-on-surface-variant mt-2"
      }, state.value.series ? /* @__PURE__ */ _jsxC(Fragment, {
        children: [
          "Filtered by category ·",
          " ",
          /* @__PURE__ */ _jsxC(Link, {
            href: "/blog/articles",
            class: "text-primary font-bold underline",
            children: "Clear filter",
            [_IMMUTABLE]: {
              href: _IMMUTABLE,
              class: _IMMUTABLE
            }
          }, 3, "WD_1")
        ]
      }, 1, "WD_2") : /* @__PURE__ */ _jsxC(Fragment, {
        children: [
          "Newest first · ",
          _fnSignal((p0) => p0.value.total, [
            state
          ], "p0.value.total"),
          " article",
          _fnSignal((p0) => p0.value.total === 1 ? "" : "s", [
            state
          ], 'p0.value.total===1?"":"s"')
        ]
      }, 3, "WD_3"), 1, null),
      state.value.series ? /* @__PURE__ */ _jsxQ("p", null, {
        class: "text-sm text-on-surface-variant mt-1"
      }, /* @__PURE__ */ _jsxC(Link, {
        href: "/blog/categories",
        class: "text-primary font-bold",
        children: "Categories",
        [_IMMUTABLE]: {
          href: _IMMUTABLE,
          class: _IMMUTABLE
        }
      }, 3, "WD_4"), 1, "WD_5") : null
    ], 1, null),
    !state.value.apiOk && /* @__PURE__ */ _jsxQ("p", null, {
      class: "px-6 text-sm text-on-surface-variant mb-6"
    }, "Could not load articles. Check the API connection.", 3, "WD_6"),
    state.value.apiOk && state.value.posts.length === 0 && /* @__PURE__ */ _jsxQ("p", null, {
      class: "px-6 text-on-surface-variant"
    }, [
      "No articles found",
      _fnSignal((p0) => p0.value.series ? " in this category" : "", [
        state
      ], 'p0.value.series?" in this category":""'),
      "."
    ], 3, "WD_7"),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
    }, state.value.posts.map((post) => /* @__PURE__ */ _jsxC(BlogPostCard, {
      post,
      categoryLabel: post.series_name || "Article",
      seriesComingSoon: false,
      [_IMMUTABLE]: {
        seriesComingSoon: _IMMUTABLE
      }
    }, 3, post.slug)), 1, null),
    state.value.apiOk && state.value.totalPages > 1 && /* @__PURE__ */ _jsxQ("nav", null, {
      class: "px-6 flex flex-wrap items-center justify-center gap-2",
      "aria-label": "Pagination"
    }, [
      state.value.page > 1 ? /* @__PURE__ */ _jsxC(Link, {
        href: buildHref(state.value.page - 1),
        class: "px-4 py-2 rounded-xl border border-outline-variant/30 text-sm font-bold text-primary hover:bg-surface-container-high no-underline",
        children: "Previous",
        [_IMMUTABLE]: {
          class: _IMMUTABLE
        }
      }, 3, "WD_8") : /* @__PURE__ */ _jsxQ("span", null, {
        class: "px-4 py-2 rounded-xl border border-outline-variant/10 text-sm text-on-surface-variant opacity-50"
      }, "Previous", 3, null),
      /* @__PURE__ */ _jsxQ("span", null, {
        class: "text-sm text-on-surface-variant px-2"
      }, [
        "Page ",
        _fnSignal((p0) => p0.value.page, [
          state
        ], "p0.value.page"),
        " of ",
        _fnSignal((p0) => p0.value.totalPages, [
          state
        ], "p0.value.totalPages")
      ], 3, null),
      state.value.page < state.value.totalPages ? /* @__PURE__ */ _jsxC(Link, {
        href: buildHref(state.value.page + 1),
        class: "px-4 py-2 rounded-xl border border-outline-variant/30 text-sm font-bold text-primary hover:bg-surface-container-high no-underline",
        children: "Next",
        [_IMMUTABLE]: {
          class: _IMMUTABLE
        }
      }, 3, "WD_9") : /* @__PURE__ */ _jsxQ("span", null, {
        class: "px-4 py-2 rounded-xl border border-outline-variant/10 text-sm text-on-surface-variant opacity-50"
      }, "Next", 3, null)
    ], 1, "WD_10")
  ], 1, "WD_11");
};
const index$b = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_uv1RswuXCss, "s_uv1RswuXCss"));
const head$a = ({ resolveValue }) => {
  const v = resolveValue(useArticlesPage);
  const title = v.series ? `${v.seriesTitle || "Articles"} — Knowledge Hub | DevUtsav` : "All articles — Knowledge Hub | DevUtsav";
  return {
    title,
    meta: [
      {
        name: "description",
        content: v.series ? `Articles in ${v.seriesTitle || v.series} on DevUtsav.` : "Browse all articles from the DevUtsav Knowledge Hub."
      }
    ]
  };
};
const BlogArticlesRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  _auto_PAGE_SIZE: PAGE_SIZE,
  default: index$b,
  head: head$a,
  useArticlesPage
}, Symbol.toStringTag, { value: "Module" }));
const s_bjc4oq19a3o = async () => {
  const base = getApiBase();
  try {
    const res = await fetch(`${base}/api/blogs/series`);
    if (!res.ok) return {
      apiOk: false,
      series: [],
      ungrouped_count: 0
    };
    const data = await res.json();
    return {
      apiOk: true,
      series: data.series || [],
      ungrouped_count: data.ungrouped_count ?? 0
    };
  } catch {
    return {
      apiOk: false,
      series: [],
      ungrouped_count: 0
    };
  }
};
const useCategories = routeLoaderQrl(/* @__PURE__ */ inlinedQrl(s_bjc4oq19a3o, "s_bjc4oq19a3o"));
const s_0IwUEWrBdx0 = () => {
  const data = useCategories();
  return /* @__PURE__ */ _jsxQ("main", null, {
    class: "px-4 md:px-0 max-w-5xl mx-auto relative pt-6 min-h-screen pb-24"
  }, [
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "px-6 mb-8"
    }, [
      /* @__PURE__ */ _jsxC(Link, {
        href: "/blog",
        class: "inline-flex items-center text-primary text-sm font-bold uppercase tracking-widest hover:underline mb-6",
        children: [
          /* @__PURE__ */ _jsxQ("span", null, {
            class: "material-symbols-outlined text-sm mr-2"
          }, "arrow_back", 3, null),
          "Knowledge hub"
        ],
        [_IMMUTABLE]: {
          href: _IMMUTABLE,
          class: _IMMUTABLE
        }
      }, 3, "Pm_0"),
      /* @__PURE__ */ _jsxQ("h1", null, {
        class: "font-headline text-3xl md:text-4xl font-bold text-on-surface"
      }, "Categories", 3, null),
      /* @__PURE__ */ _jsxQ("p", null, {
        class: "text-on-surface-variant mt-2 max-w-2xl"
      }, "Each topic links to its articles. General posts live under “All articles”.", 3, null)
    ], 1, null),
    !data.value.apiOk && /* @__PURE__ */ _jsxQ("p", null, {
      class: "px-6 text-sm text-on-surface-variant mb-6"
    }, "Could not load categories. Check the API connection.", 3, "Pm_1"),
    /* @__PURE__ */ _jsxQ("ul", null, {
      class: "px-6 space-y-4 mb-10"
    }, data.value.series.map((s) => /* @__PURE__ */ _jsxQ("li", null, null, s.coming_soon ? /* @__PURE__ */ _jsxQ("div", null, {
      class: "block rounded-3xl border border-outline-variant/20 bg-surface-container-low p-6 opacity-90"
    }, /* @__PURE__ */ _jsxQ("div", null, {
      class: "flex flex-wrap items-start justify-between gap-3"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, null, [
        /* @__PURE__ */ _jsxQ("h2", null, {
          class: "font-headline text-xl font-bold text-on-surface"
        }, _wrapSignal(s, "name"), 1, null),
        s.description ? /* @__PURE__ */ _jsxQ("p", null, {
          class: "text-sm text-on-surface-variant mt-2 max-w-2xl"
        }, _wrapSignal(s, "description"), 1, "Pm_2") : null
      ], 1, null),
      /* @__PURE__ */ _jsxQ("span", null, {
        class: "bg-amber-500/15 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase border border-amber-500/30 shrink-0"
      }, "Coming soon", 3, null)
    ], 1, null), 1, "Pm_3") : /* @__PURE__ */ _jsxC(Link, {
      href: `/blog/articles?series=${encodeURIComponent(s.slug)}`,
      class: "block rounded-3xl border border-outline-variant/20 bg-surface-container-low p-6 no-underline text-inherit transition-all hover:border-primary/35 hover:shadow-md",
      children: /* @__PURE__ */ _jsxQ("div", null, {
        class: "flex flex-wrap items-start justify-between gap-3"
      }, [
        /* @__PURE__ */ _jsxQ("div", null, null, [
          /* @__PURE__ */ _jsxQ("h2", null, {
            class: "font-headline text-xl font-bold text-on-surface"
          }, _wrapSignal(s, "name"), 1, null),
          s.description ? /* @__PURE__ */ _jsxQ("p", null, {
            class: "text-sm text-on-surface-variant mt-2 max-w-2xl"
          }, _wrapSignal(s, "description"), 1, "Pm_4") : null,
          /* @__PURE__ */ _jsxQ("p", null, {
            class: "text-xs text-on-surface-variant mt-3"
          }, [
            _wrapSignal(s, "post_count"),
            " article",
            s.post_count === 1 ? "" : "s"
          ], 1, null)
        ], 1, null),
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "material-symbols-outlined text-primary text-2xl shrink-0"
        }, "chevron_right", 3, null)
      ], 1, null),
      [_IMMUTABLE]: {
        class: _IMMUTABLE
      }
    }, 1, "Pm_5"), 1, s._id)), 1, null),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "px-6"
    }, [
      /* @__PURE__ */ _jsxC(Link, {
        href: "/blog/articles",
        class: "inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-5 py-3 text-primary font-bold text-sm hover:bg-primary/10 no-underline",
        children: [
          /* @__PURE__ */ _jsxQ("span", null, {
            class: "material-symbols-outlined text-lg"
          }, "library_books", 3, null),
          "View all articles"
        ],
        [_IMMUTABLE]: {
          href: _IMMUTABLE,
          class: _IMMUTABLE
        }
      }, 3, "Pm_6"),
      data.value.ungrouped_count > 0 ? /* @__PURE__ */ _jsxQ("p", null, {
        class: "text-xs text-on-surface-variant mt-2"
      }, "Includes posts without a category.", 3, "Pm_7") : null
    ], 1, null)
  ], 1, "Pm_8");
};
const index$a = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_0IwUEWrBdx0, "s_0IwUEWrBdx0"));
const head$9 = {
  title: "Categories — Knowledge Hub | DevUtsav",
  meta: [
    {
      name: "description",
      content: "Browse article categories and series on DevUtsav."
    }
  ]
};
const BlogCategoriesRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index$a,
  head: head$9,
  useCategories
}, Symbol.toStringTag, { value: "Module" }));
const s_70y03QzmX2M = () => {
  const store = useContext(PulseCtx);
  if (!store.pulse) return /* @__PURE__ */ _jsxQ("div", null, {
    class: "p-8"
  }, [
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-amber mb-2"
    }, "Waiting for metrics …", 3, null),
    store.errorMsg && /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-red mb-2"
    }, [
      "Error: ",
      _fnSignal((p0) => p0.errorMsg, [
        store
      ], "p0.errorMsg")
    ], 3, "iQ_0"),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "term-dim text-[11px] leading-relaxed"
    }, [
      "· backend not running — ",
      /* @__PURE__ */ _jsxQ("span", null, {
        class: "term-cyan"
      }, "cd backend && npm run dev", 3, null),
      /* @__PURE__ */ _jsxQ("br", null, null, null, 3, null),
      "· token mismatch — LOGOUT and re-enter the value from ",
      /* @__PURE__ */ _jsxQ("span", null, {
        class: "term-cyan"
      }, "backend/.env ADMIN_API_TOKEN", 3, null),
      /* @__PURE__ */ _jsxQ("br", null, null, null, 3, null),
      "· check the browser network tab if the request is failing"
    ], 3, null)
  ], 1, "iQ_1");
  return /* @__PURE__ */ _jsxC(Fragment, {
    children: [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "overflow-hidden border-b border-[#1f2937] bg-black"
      }, /* @__PURE__ */ _jsxQ("div", null, {
        class: "whitespace-nowrap py-1 term-marquee inline-block"
      }, [
        ...store.pulse.recent_events,
        ...store.pulse.recent_events
      ].slice(0, 80).map((e, i) => /* @__PURE__ */ _jsxQ("span", null, {
        class: "inline-block px-4 border-r border-[#1f2937]"
      }, [
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "term-amber"
        }, fmtTime(e.ts), 1, null),
        " ",
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "term-cyan"
        }, _wrapSignal(e, "type"), 1, null),
        " ",
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "term-dim"
        }, e.path || e.blog_slug || e.section_id || "", 1, null),
        e.scroll_pct != null && /* @__PURE__ */ _jsxQ("span", null, {
          class: "term-green"
        }, [
          " · ",
          _wrapSignal(e, "scroll_pct"),
          "%"
        ], 1, "iQ_2")
      ], 1, i)), 1, null), 1, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "grid grid-cols-2 md:grid-cols-7 term-grid"
      }, [
        [
          "LIVE 5M",
          store.pulse.realtime.live_5m,
          "term-green"
        ],
        [
          "PV 1H",
          store.pulse.realtime.pv_1h,
          "term-amber"
        ],
        [
          "PV 24H",
          store.pulse.realtime.pv_24h,
          "term-amber"
        ],
        [
          "PV 7D",
          store.pulse.realtime.pv_7d,
          "term-amber"
        ],
        [
          "UNIQ 24H",
          store.pulse.realtime.unique_24h,
          "term-cyan"
        ],
        [
          "UNIQ 7D",
          store.pulse.realtime.unique_7d,
          "term-cyan"
        ],
        [
          "SESSIONS",
          store.pulse.realtime.sessions_total,
          "term-cyan"
        ]
      ].map(([label, val, color]) => /* @__PURE__ */ _jsxQ("div", null, {
        class: "term-cell"
      }, [
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "term-dim text-[10px] uppercase tracking-widest"
        }, label, 1, null),
        /* @__PURE__ */ _jsxQ("div", {
          class: `${color} text-2xl font-bold tabular-nums`
        }, null, val, 1, null)
      ], 1, label)), 1, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "term-cell border-b border-[#1f2937] flex items-center gap-4"
      }, [
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "term-dim text-[10px] uppercase tracking-widest"
        }, "PV · 24H", 3, null),
        /* @__PURE__ */ _jsxQ("svg", null, {
          width: "100%",
          height: "36",
          viewBox: "0 0 240 40",
          preserveAspectRatio: "none",
          class: "flex-1"
        }, /* @__PURE__ */ _jsxQ("path", {
          d: sparkPath(store.pulse.sparkline_24h)
        }, {
          stroke: "#ffb000",
          "stroke-width": "1.2",
          fill: "none",
          "vector-effect": "non-scaling-stroke"
        }, null, 3, null), 1, null)
      ], 1, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "p-3"
      }, [
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "term-amber font-bold tracking-widest mb-2"
        }, "TOP BLOGS // 7D", 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "overflow-x-auto"
        }, /* @__PURE__ */ _jsxQ("table", null, {
          class: "w-full"
        }, [
          /* @__PURE__ */ _jsxQ("thead", null, null, /* @__PURE__ */ _jsxQ("tr", null, {
            class: "term-dim text-[10px] uppercase"
          }, [
            /* @__PURE__ */ _jsxQ("th", null, {
              class: "text-left py-1"
            }, "SLUG", 3, null),
            /* @__PURE__ */ _jsxQ("th", null, {
              class: "text-right"
            }, "VIEWS", 3, null),
            /* @__PURE__ */ _jsxQ("th", null, {
              class: "text-right"
            }, "UNIQUE", 3, null),
            /* @__PURE__ */ _jsxQ("th", null, {
              class: "text-right"
            }, "AVG SCROLL", 3, null),
            /* @__PURE__ */ _jsxQ("th", null, {
              class: "text-right"
            }, "AVG TIME", 3, null)
          ], 3, null), 3, null),
          /* @__PURE__ */ _jsxQ("tbody", null, null, [
            store.pulse.blogs.length === 0 && /* @__PURE__ */ _jsxQ("tr", null, null, /* @__PURE__ */ _jsxQ("td", null, {
              colSpan: 5,
              class: "term-dim py-4"
            }, "no blog views yet", 3, null), 3, "iQ_3"),
            store.pulse.blogs.map((row) => /* @__PURE__ */ _jsxQ("tr", null, {
              class: "term-row border-t border-[#111827]"
            }, [
              /* @__PURE__ */ _jsxQ("td", null, {
                class: "py-2 term-cyan"
              }, _wrapSignal(row, "slug"), 1, null),
              /* @__PURE__ */ _jsxQ("td", null, {
                class: "text-right tabular-nums term-amber"
              }, _wrapSignal(row, "views"), 1, null),
              /* @__PURE__ */ _jsxQ("td", null, {
                class: "text-right tabular-nums"
              }, _wrapSignal(row, "sessions"), 1, null),
              /* @__PURE__ */ _jsxQ("td", null, {
                class: "text-right tabular-nums"
              }, pct(row.avg_scroll), 1, null),
              /* @__PURE__ */ _jsxQ("td", null, {
                class: "text-right tabular-nums"
              }, dur(row.avg_time), 1, null)
            ], 1, row.slug))
          ], 1, null)
        ], 1, null), 1, null)
      ], 1, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "p-3 term-dim text-[11px]"
      }, [
        "Drill into ",
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "term-cyan"
        }, "PAGES", 3, null),
        ", ",
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "term-cyan"
        }, "BLOGS", 3, null),
        ", ",
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "term-cyan"
        }, "SCHEDULER", 3, null),
        ", or ",
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "term-cyan"
        }, "EVENTS", 3, null),
        " via the nav above."
      ], 3, null)
    ]
  }, 1, "iQ_4");
};
const index$9 = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_70y03QzmX2M, "s_70y03QzmX2M"));
const AdminRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index$9
}, Symbol.toStringTag, { value: "Module" }));
const LOADING_MSGS$1 = [
  "Fetching Kundali...",
  "Aligning cosmic coordinates...",
  "Analyzing planetary positions...",
  "Finding deep-rooted Doshas...",
  "Compiling spiritual remedies..."
];
const s_lNRXnwkvMts = async (val) => {
  const [isSearchingPob, pobSuggestions] = useLexicalScope();
  if (val.length < 3) {
    pobSuggestions.value = [];
    return;
  }
  isSearchingPob.value = true;
  try {
    const api = "http://localhost:5001";
    const res = await fetch(`${api}/api/location/autocomplete?input=${encodeURIComponent(val)}`);
    pobSuggestions.value = await res.json();
  } catch {
    pobSuggestions.value = [];
  } finally {
    isSearchingPob.value = false;
  }
};
const s_06cpT4mvFQI = async (description, placeId) => {
  const [form, isSearchingPob, pobSuggestions] = useLexicalScope();
  form.pob = description;
  form.place_id = placeId;
  pobSuggestions.value = [];
  isSearchingPob.value = true;
  try {
    const api = "http://localhost:5001";
    const res = await fetch(`${api}/api/location/details?place_id=${placeId}`);
    const d = await res.json();
    if (d == null ? void 0 : d.lat) {
      form.pob_lat = d.lat;
      form.pob_lon = d.lng;
      form.pob_city = d.city;
      form.pob_state = d.state;
      form.pob_country = d.country;
    }
  } catch {
  } finally {
    isSearchingPob.value = false;
  }
};
const s_D0d3b5xhXxU = () => {
  const step = useSignal(1);
  const tobUnknown = useSignal(false);
  const isAnalyzing = useSignal(false);
  const validationError = useSignal("");
  const loadingMsgIdx = useSignal(0);
  const report = useSignal(null);
  const kundaliLink = useSignal(null);
  const sessionId = useSignal("");
  const pobSuggestions = useSignal([]);
  const isSearchingPob = useSignal(false);
  const form = useStore({
    name: "",
    phone: "",
    isd_code: "+91",
    email: "",
    dob_y: "",
    dob_m: "",
    dob_d: "",
    tob_h: "",
    tob_m: "",
    pob: "",
    pob_lat: null,
    pob_lon: null,
    pob_city: "",
    pob_state: "",
    pob_country: "",
    place_id: ""
  });
  useVisibleTaskQrl(/* @__PURE__ */ _noopQrl("s_RMneClKUq7A", [
    kundaliLink,
    report,
    sessionId,
    step
  ]));
  const fetchSuggestions = /* @__PURE__ */ inlinedQrl(s_lNRXnwkvMts, "s_lNRXnwkvMts", [
    isSearchingPob,
    pobSuggestions
  ]);
  const selectPob = /* @__PURE__ */ inlinedQrl(s_06cpT4mvFQI, "s_06cpT4mvFQI", [
    form,
    isSearchingPob,
    pobSuggestions
  ]);
  return /* @__PURE__ */ _jsxQ("main", null, {
    class: "px-4 md:px-0 max-w-5xl mx-auto relative pt-12 pb-24"
  }, [
    step.value < 3 && /* @__PURE__ */ _jsxQ("section", null, {
      class: "px-6 mb-10 text-center"
    }, [
      /* @__PURE__ */ _jsxQ("h1", null, {
        class: "font-headline text-4xl md:text-5xl font-black text-on-surface leading-tight tracking-tight mb-4"
      }, [
        "Kundali Dosha ",
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "text-secondary italic"
        }, "Calculator", 3, null)
      ], 3, null),
      /* @__PURE__ */ _jsxQ("p", null, {
        class: "text-on-surface-variant font-body text-lg max-w-xl mx-auto"
      }, "Enter your precise birth details. Our AI will analyze your planetary alignments.", 3, null)
    ], 3, "zh_0"),
    step.value === 1 && /* @__PURE__ */ _jsxQ("section", null, {
      class: "w-full mt-8"
    }, /* @__PURE__ */ _jsxQ("div", null, {
      class: "w-full"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "flex items-center justify-between mb-8"
      }, [
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "font-label text-sm uppercase tracking-widest text-primary font-bold"
        }, "Step 1 of 2", 3, null),
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "text-base font-bold text-on-surface-variant"
        }, "Personal Info", 3, null)
      ], 3, null),
      validationError.value && /* @__PURE__ */ _jsxQ("div", null, {
        class: "bg-error/10 text-error text-sm font-bold px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
      }, [
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "material-symbols-outlined text-sm"
        }, "error", 3, null),
        _fnSignal((p0) => p0.value, [
          validationError
        ], "p0.value")
      ], 3, "zh_1"),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
      }, [
        /* @__PURE__ */ _jsxQ("div", null, null, [
          /* @__PURE__ */ _jsxQ("label", null, {
            class: "block text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3"
          }, "Full Name *", 3, null),
          /* @__PURE__ */ _jsxQ("input", null, {
            value: _fnSignal((p0) => p0.name, [
              form
            ], "p0.name"),
            class: "w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-6 py-5 text-on-surface text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow",
            placeholder: "e.g. Rahul Sharma",
            onInput$: /* @__PURE__ */ _noopQrl("s_JPzwk44W7e0", [
              form
            ])
          }, null, 3, null)
        ], 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "flex gap-4"
        }, [
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "w-[30%]"
          }, [
            /* @__PURE__ */ _jsxQ("label", null, {
              class: "block text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3"
            }, "ISD", 3, null),
            /* @__PURE__ */ _jsxQ("input", null, {
              value: _fnSignal((p0) => p0.isd_code, [
                form
              ], "p0.isd_code"),
              class: "w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-6 py-5 text-on-surface text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow",
              onInput$: /* @__PURE__ */ _noopQrl("s_MRmYZm2lBFY", [
                form
              ])
            }, null, 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "flex-1"
          }, [
            /* @__PURE__ */ _jsxQ("label", null, {
              class: "block text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3"
            }, "Phone *", 3, null),
            /* @__PURE__ */ _jsxQ("input", null, {
              type: "tel",
              value: _fnSignal((p0) => p0.phone, [
                form
              ], "p0.phone"),
              class: "w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-6 py-5 text-on-surface text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow",
              placeholder: "10 Digits",
              onInput$: /* @__PURE__ */ _noopQrl("s_0YDlGZ0Sqxo", [
                form
              ])
            }, null, 3, null)
          ], 3, null)
        ], 3, null),
        /* @__PURE__ */ _jsxQ("div", null, null, [
          /* @__PURE__ */ _jsxQ("label", null, {
            class: "block text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3"
          }, "Email (Optional)", 3, null),
          /* @__PURE__ */ _jsxQ("input", null, {
            type: "email",
            value: _fnSignal((p0) => p0.email, [
              form
            ], "p0.email"),
            class: "w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-6 py-5 text-on-surface text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow",
            placeholder: "rahul@example.com",
            onInput$: /* @__PURE__ */ _noopQrl("s_dPCrR2u7AjQ", [
              form
            ])
          }, null, 3, null)
        ], 3, null)
      ], 3, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "mt-12 flex justify-end"
      }, /* @__PURE__ */ _jsxQ("button", null, {
        class: "px-12 py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all text-sm tracking-widest uppercase flex items-center",
        onClick$: /* @__PURE__ */ _noopQrl("s_k0Ufhz1qSFk", [
          form,
          step,
          validationError
        ])
      }, [
        "Continue ",
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "material-symbols-outlined text-sm ml-2"
        }, "arrow_forward", 3, null)
      ], 3, null), 3, null)
    ], 1, null), 1, "zh_2"),
    step.value === 2 && /* @__PURE__ */ _jsxQ("section", null, {
      class: "max-w-6xl mx-auto w-full mt-8"
    }, /* @__PURE__ */ _jsxQ("div", null, {
      class: "w-full"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "flex items-center justify-between mb-8"
      }, [
        /* @__PURE__ */ _jsxQ("button", null, {
          class: "text-on-surface-variant hover:text-primary transition-colors flex items-center bg-surface-container px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest shadow-sm",
          onClick$: /* @__PURE__ */ _noopQrl("s_aBSvEUWKgCs", [
            step
          ])
        }, [
          /* @__PURE__ */ _jsxQ("span", null, {
            class: "material-symbols-outlined text-sm mr-1"
          }, "arrow_back", 3, null),
          " Back"
        ], 3, null),
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "text-base font-bold text-on-surface-variant"
        }, "Birth Details", 3, null)
      ], 3, null),
      validationError.value && /* @__PURE__ */ _jsxQ("div", null, {
        class: "bg-error/10 text-error text-sm font-bold px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
      }, [
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "material-symbols-outlined text-sm"
        }, "error", 3, null),
        _fnSignal((p0) => p0.value, [
          validationError
        ], "p0.value")
      ], 3, "zh_3"),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      }, [
        /* @__PURE__ */ _jsxQ("div", null, null, [
          /* @__PURE__ */ _jsxQ("label", null, {
            class: "block text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3"
          }, "Date of Birth (Year, Month, Date) *", 3, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "flex gap-2"
          }, [
            /* @__PURE__ */ _jsxQ("input", null, {
              type: "number",
              placeholder: "YYYY",
              value: _fnSignal((p0) => p0.dob_y, [
                form
              ], "p0.dob_y"),
              class: "w-[40%] bg-surface-container-low border border-outline-variant/20 rounded-2xl px-4 py-5 text-on-surface text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow",
              onInput$: /* @__PURE__ */ _noopQrl("s_C7Q4kIhRecE", [
                form
              ])
            }, null, 3, null),
            /* @__PURE__ */ _jsxQ("input", null, {
              type: "number",
              placeholder: "MM",
              value: _fnSignal((p0) => p0.dob_m, [
                form
              ], "p0.dob_m"),
              class: "w-[30%] bg-surface-container-low border border-outline-variant/20 rounded-2xl px-4 py-5 text-on-surface text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow",
              onInput$: /* @__PURE__ */ _noopQrl("s_fXu8jsghFG8", [
                form
              ])
            }, null, 3, null),
            /* @__PURE__ */ _jsxQ("input", null, {
              type: "number",
              placeholder: "DD",
              value: _fnSignal((p0) => p0.dob_d, [
                form
              ], "p0.dob_d"),
              class: "w-[30%] bg-surface-container-low border border-outline-variant/20 rounded-2xl px-4 py-5 text-on-surface text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow",
              onInput$: /* @__PURE__ */ _noopQrl("s_seuP3SJbLag", [
                form
              ])
            }, null, 3, null)
          ], 3, null)
        ], 3, null),
        /* @__PURE__ */ _jsxQ("div", null, null, [
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "flex items-center justify-between mb-3"
          }, [
            /* @__PURE__ */ _jsxQ("label", null, {
              class: "block text-sm font-bold uppercase tracking-widest text-on-surface-variant"
            }, "Time of Birth (24Hr)", 3, null),
            /* @__PURE__ */ _jsxQ("label", null, {
              class: "flex items-center gap-2 text-xs font-bold text-on-surface-variant cursor-pointer"
            }, [
              /* @__PURE__ */ _jsxQ("input", null, {
                type: "checkbox",
                checked: _fnSignal((p0) => p0.value, [
                  tobUnknown
                ], "p0.value"),
                class: "w-4 h-4 rounded border-outline-variant/30 text-primary cursor-pointer focus:ring-primary/50",
                onChange$: /* @__PURE__ */ _noopQrl("s_WbDmSOF7Q6I", [
                  form,
                  tobUnknown
                ])
              }, null, 3, null),
              /* @__PURE__ */ _jsxQ("span", null, null, "I don't know", 3, null)
            ], 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "flex gap-2 relative group"
          }, [
            /* @__PURE__ */ _jsxQ("select", null, {
              disabled: _fnSignal((p0) => p0.value, [
                tobUnknown
              ], "p0.value"),
              value: _fnSignal((p0) => p0.tob_h, [
                form
              ], "p0.tob_h"),
              class: "w-1/2 bg-surface-container-low border border-outline-variant/20 rounded-2xl px-4 py-5 text-on-surface text-lg text-center focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm disabled:opacity-50 appearance-none",
              onChange$: /* @__PURE__ */ _noopQrl("s_sPDyUX91XAs", [
                form
              ])
            }, [
              /* @__PURE__ */ _jsxQ("option", null, {
                value: "",
                disabled: true,
                selected: true
              }, "Hour (00)", 3, null),
              Array.from({
                length: 24
              }).map((_, i) => /* @__PURE__ */ _jsxQ("option", {
                value: i.toString().padStart(2, "0")
              }, null, i.toString().padStart(2, "0"), 1, "zh_4"))
            ], 1, null),
            /* @__PURE__ */ _jsxQ("div", null, {
              class: "absolute left-1/4 top-1/2 -translate-y-1/2 -translate-x-3 pointer-events-none text-on-surface-variant group-hover:text-primary"
            }, /* @__PURE__ */ _jsxQ("span", null, {
              class: "material-symbols-outlined text-sm"
            }, "expand_more", 3, null), 3, null),
            /* @__PURE__ */ _jsxQ("select", null, {
              disabled: _fnSignal((p0) => p0.value, [
                tobUnknown
              ], "p0.value"),
              value: _fnSignal((p0) => p0.tob_m, [
                form
              ], "p0.tob_m"),
              class: "w-1/2 bg-surface-container-low border border-outline-variant/20 rounded-2xl px-4 py-5 text-on-surface text-lg text-center focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm disabled:opacity-50 appearance-none",
              onChange$: /* @__PURE__ */ _noopQrl("s_2hQZAK22GoQ", [
                form
              ])
            }, [
              /* @__PURE__ */ _jsxQ("option", null, {
                value: "",
                disabled: true,
                selected: true
              }, "Min (00)", 3, null),
              Array.from({
                length: 60
              }).map((_, i) => /* @__PURE__ */ _jsxQ("option", {
                value: i.toString().padStart(2, "0")
              }, null, i.toString().padStart(2, "0"), 1, "zh_5"))
            ], 1, null),
            /* @__PURE__ */ _jsxQ("div", null, {
              class: "absolute right-[calc(25%-12px)] top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant group-hover:text-primary"
            }, /* @__PURE__ */ _jsxQ("span", null, {
              class: "material-symbols-outlined text-sm"
            }, "expand_more", 3, null), 3, null)
          ], 1, null)
        ], 1, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "relative"
        }, [
          /* @__PURE__ */ _jsxQ("label", null, {
            class: "block text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3"
          }, "Place of Birth *", 3, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "relative"
          }, [
            /* @__PURE__ */ _jsxQ("input", null, {
              type: "text",
              value: _fnSignal((p0) => p0.pob, [
                form
              ], "p0.pob"),
              placeholder: "e.g. New Delhi, India",
              autoComplete: "off",
              class: "w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-6 py-5 text-on-surface text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow",
              onInput$: /* @__PURE__ */ _noopQrl("s_ioyoxC0zxRo", [
                fetchSuggestions,
                form
              ])
            }, null, 3, null),
            isSearchingPob.value && /* @__PURE__ */ _jsxQ("div", null, {
              class: "absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"
            }, null, 3, "zh_6")
          ], 1, null),
          /* @__PURE__ */ _jsxQ("span", null, {
            class: "text-xs text-on-surface-variant/60 mt-3 block pl-2"
          }, "Select matched city from dropdown!", 3, null),
          pobSuggestions.value.length > 0 && /* @__PURE__ */ _jsxQ("div", null, {
            class: "absolute top-[85px] w-full bg-white border border-outline-variant/30 rounded-2xl shadow-2xl z-20 overflow-hidden max-h-56 overflow-y-auto"
          }, pobSuggestions.value.map((place, idx) => /* @__PURE__ */ _jsxQ("div", {
            onClick$: /* @__PURE__ */ _noopQrl("s_kC0ZQplVeQs", [
              place,
              selectPob
            ])
          }, {
            class: "px-5 py-4 hover:bg-surface-variant border-b border-outline-variant/10 cursor-pointer text-base font-medium transition-colors text-on-surface"
          }, _wrapSignal(place, "description"), 0, idx)), 1, "zh_7")
        ], 1, null)
      ], 1, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "mt-12 flex justify-end"
      }, /* @__PURE__ */ _jsxQ("button", null, {
        class: "px-8 md:px-12 py-4 bg-gradient-to-r from-secondary to-tertiary text-white font-bold rounded-2xl shadow-lg shadow-secondary/20 active:scale-95 transition-all text-sm tracking-widest uppercase flex justify-center items-center gap-2",
        onClick$: /* @__PURE__ */ _noopQrl("s_LJKkpRmyPHk", [
          form,
          isAnalyzing,
          kundaliLink,
          loadingMsgIdx,
          report,
          sessionId,
          step,
          tobUnknown,
          validationError
        ])
      }, [
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "material-symbols-outlined text-xl",
          style: "font-variation-settings: 'FILL' 1"
        }, "auto_awesome", 3, null),
        "Analyze My Kundali Dosha"
      ], 3, null), 3, null)
    ], 1, null), 1, "zh_8"),
    step.value === 3 && /* @__PURE__ */ _jsxQ("section", null, {
      class: "px-6 flex flex-col items-center justify-center min-h-[40vh]"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "relative w-32 h-32 mb-8"
      }, [
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "absolute inset-0 rounded-full border-4 border-primary/20"
        }, null, 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "absolute inset-[3px] rounded-full border-b-4 border-l-4 border-primary animate-[spin_2s_linear_infinite]"
        }, null, 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "absolute inset-[8px] rounded-full border-t-4 border-r-4 border-secondary animate-[spin_3s_linear_infinite_reverse]"
        }, null, 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "absolute inset-0 flex items-center justify-center"
        }, /* @__PURE__ */ _jsxQ("span", null, {
          class: "material-symbols-outlined text-5xl text-primary animate-pulse",
          style: "font-variation-settings: 'FILL' 1"
        }, "stars", 3, null), 3, null)
      ], 3, null),
      /* @__PURE__ */ _jsxQ("h3", null, {
        class: "font-headline text-2xl font-bold text-on-surface mb-3 min-h-[32px]"
      }, LOADING_MSGS$1[loadingMsgIdx.value], 1, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "w-48 bg-surface-variant rounded-full h-1.5 overflow-hidden"
      }, /* @__PURE__ */ _jsxQ("div", {
        style: `width: ${(loadingMsgIdx.value + 1) / LOADING_MSGS$1.length * 100}%; transition: width 0.8s ease`
      }, {
        class: "h-full bg-gradient-to-r from-primary to-secondary animate-pulse"
      }, null, 3, null), 1, null)
    ], 1, "zh_9"),
    step.value === 4 && report.value && /* @__PURE__ */ _jsxQ("section", null, {
      class: "px-6 max-w-3xl mx-auto space-y-12"
    }, /* @__PURE__ */ _jsxQ("div", null, {
      class: "bg-surface-container rounded-3xl p-8 shadow-xl shadow-primary/10 border border-primary/20"
    }, [
      /* @__PURE__ */ _jsxQ("h2", null, {
        class: "font-headline text-3xl font-black text-on-surface mb-6"
      }, "Your Dosha Report", 3, null),
      kundaliLink.value && /* @__PURE__ */ _jsxQ("a", null, {
        href: _fnSignal((p0) => p0.value, [
          kundaliLink
        ], "p0.value"),
        target: "_blank",
        rel: "noopener noreferrer",
        class: "inline-flex items-center gap-2 mb-6 px-5 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-colors"
      }, [
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "material-symbols-outlined text-sm"
        }, "open_in_new", 3, null),
        " View Full Kundali Chart"
      ], 3, "zh_10"),
      /* @__PURE__ */ _jsxQ("pre", null, {
        class: "whitespace-pre-wrap text-on-surface-variant leading-relaxed text-sm"
      }, JSON.stringify(report.value, null, 2), 1, null)
    ], 1, null), 1, "zh_11")
  ], 1, "zh_12");
};
const index$8 = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_D0d3b5xhXxU, "s_D0d3b5xhXxU"));
const head$8 = {
  title: "Kundali Dosha Calculator — Devutsav",
  meta: [
    {
      name: "description",
      content: "Analyze your Kundali and identify hidden Doshas using AI-powered astrological analysis. Get personalized spiritual insights on Devutsav."
    },
    {
      property: "og:title",
      content: "Kundali Dosha Calculator — Devutsav"
    }
  ]
};
const AnalyzerRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  _auto_LOADING_MSGS: LOADING_MSGS$1,
  default: index$8,
  head: head$8
}, Symbol.toStringTag, { value: "Module" }));
const s_9prfMJh09n0 = async () => {
  const base = getApiBase();
  try {
    const res = await fetch(`${base}/api/blogs/hub`);
    if (!res.ok) return {
      apiOk: false,
      featuredLegacy: blogPosts
    };
    const data = await res.json();
    const slugs = /* @__PURE__ */ new Set();
    for (const s of data.series || []) {
      for (const p of s.posts || []) if (p.slug) slugs.add(p.slug);
    }
    for (const p of data.ungrouped || []) if (p.slug) slugs.add(p.slug);
    const featuredLegacy = blogPosts.filter((p) => !slugs.has(p.slug));
    return {
      apiOk: true,
      featuredLegacy
    };
  } catch {
    return {
      apiOk: false,
      featuredLegacy: blogPosts
    };
  }
};
const useBlogLanding = routeLoaderQrl(/* @__PURE__ */ inlinedQrl(s_9prfMJh09n0, "s_9prfMJh09n0"));
const s_pb9ig8tqRfw = () => {
  const landing = useBlogLanding();
  return /* @__PURE__ */ _jsxQ("main", null, {
    class: "px-4 sm:px-6 max-w-5xl mx-auto relative pt-6"
  }, [
    /* @__PURE__ */ _jsxQ("section", null, {
      class: "mb-8 md:mb-12"
    }, /* @__PURE__ */ _jsxQ("div", null, {
      class: "relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-surface-container-high md:aspect-[4/1] md:min-h-[200px] flex flex-col justify-center p-6 md:p-8"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "absolute inset-0"
      }, /* @__PURE__ */ _jsxQ("div", null, {
        class: "absolute inset-0 bg-gradient-to-r from-primary to-primary-container opacity-90"
      }, null, 3, null), 3, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "relative z-10 space-y-3 md:space-y-4"
      }, [
        /* @__PURE__ */ _jsxQ("h1", null, {
          class: "font-headline text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-[1.15] break-words"
        }, "DevUtsav Knowledge Hub", 3, null),
        /* @__PURE__ */ _jsxQ("p", null, {
          class: "text-white/80 max-w-2xl font-body text-sm sm:text-base md:text-lg"
        }, "Browse topics by category or see every article in one place—with pagination for easy scanning.", 3, null)
      ], 3, null)
    ], 3, null), 3, null),
    !landing.value.apiOk && /* @__PURE__ */ _jsxQ("p", null, {
      class: "text-sm text-on-surface-variant mb-8"
    }, [
      "Could not reach the article API. Start the backend and set",
      " ",
      /* @__PURE__ */ _jsxQ("code", null, {
        class: "text-xs bg-surface-container-high px-1 rounded"
      }, "PUBLIC_API_URL", 3, null),
      " for live categories and lists."
    ], 3, "xI_0"),
    /* @__PURE__ */ _jsxQ("section", null, {
      class: "mb-12 md:mb-14"
    }, [
      /* @__PURE__ */ _jsxQ("h2", null, {
        class: "font-headline text-xl font-bold text-on-surface mb-4"
      }, "Explore", 3, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "grid grid-cols-1 sm:grid-cols-2 gap-4"
      }, [
        /* @__PURE__ */ _jsxC(Link, {
          href: "/blog/categories",
          class: "flex gap-4 p-6 rounded-3xl bg-surface-container border border-outline-variant/20 hover:border-primary/40 hover:shadow-md transition-all no-underline text-inherit",
          children: [
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container"
            }, /* @__PURE__ */ _jsxQ("span", null, {
              class: "material-symbols-outlined text-3xl"
            }, "folder_special", 3, null), 3, null),
            /* @__PURE__ */ _jsxQ("div", null, null, [
              /* @__PURE__ */ _jsxQ("h3", null, {
                class: "font-headline font-bold text-lg text-on-surface"
              }, "Categories", 3, null),
              /* @__PURE__ */ _jsxQ("p", null, {
                class: "text-sm text-on-surface-variant mt-1"
              }, "Series and topics—jump into a theme.", 3, null),
              /* @__PURE__ */ _jsxQ("span", null, {
                class: "inline-flex items-center gap-1 text-primary text-xs font-bold mt-3"
              }, [
                "Open",
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "material-symbols-outlined text-sm"
                }, "arrow_forward", 3, null)
              ], 3, null)
            ], 3, null)
          ],
          [_IMMUTABLE]: {
            href: _IMMUTABLE,
            class: _IMMUTABLE
          }
        }, 3, "xI_1"),
        /* @__PURE__ */ _jsxC(Link, {
          href: "/blog/articles",
          class: "flex gap-4 p-6 rounded-3xl bg-surface-container border border-outline-variant/20 hover:border-primary/40 hover:shadow-md transition-all no-underline text-inherit",
          children: [
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container"
            }, /* @__PURE__ */ _jsxQ("span", null, {
              class: "material-symbols-outlined text-3xl"
            }, "library_books", 3, null), 3, null),
            /* @__PURE__ */ _jsxQ("div", null, null, [
              /* @__PURE__ */ _jsxQ("h3", null, {
                class: "font-headline font-bold text-lg text-on-surface"
              }, "All articles", 3, null),
              /* @__PURE__ */ _jsxQ("p", null, {
                class: "text-sm text-on-surface-variant mt-1"
              }, "Full library, newest first—with pages.", 3, null),
              /* @__PURE__ */ _jsxQ("span", null, {
                class: "inline-flex items-center gap-1 text-primary text-xs font-bold mt-3"
              }, [
                "Open",
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "material-symbols-outlined text-sm"
                }, "arrow_forward", 3, null)
              ], 3, null)
            ], 3, null)
          ],
          [_IMMUTABLE]: {
            href: _IMMUTABLE,
            class: _IMMUTABLE
          }
        }, 3, "xI_2")
      ], 1, null)
    ], 1, null),
    landing.value.featuredLegacy.length > 0 && /* @__PURE__ */ _jsxQ("section", null, null, [
      /* @__PURE__ */ _jsxQ("h2", null, {
        class: "font-headline text-2xl md:text-3xl font-bold text-on-surface mb-6"
      }, "Featured guides", 3, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      }, landing.value.featuredLegacy.map((post) => /* @__PURE__ */ _jsxC(BlogPostCard, {
        post: {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt
        },
        get categoryLabel() {
          return post.category;
        },
        [_IMMUTABLE]: {
          categoryLabel: _wrapProp(post, "category")
        }
      }, 3, post.id)), 1, null)
    ], 1, "xI_3")
  ], 1, "xI_4");
};
const index$7 = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_pb9ig8tqRfw, "s_pb9ig8tqRfw"));
const head$7 = {
  title: "Knowledge Hub — DevUtsav",
  meta: [
    {
      name: "description",
      content: "Spiritual guides and articles from DevUtsav—browse by category or read the full list."
    }
  ]
};
const BlogRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index$7,
  head: head$7,
  useBlogLanding
}, Symbol.toStringTag, { value: "Module" }));
const s_sbOeuufQyc8 = async () => {
  var _a;
  try {
    const res = await fetch(`${getApiBase()}/api/market/chadhawas`);
    const data = await res.json();
    const list = ((_a = data == null ? void 0 : data.results) == null ? void 0 : _a.data) || (data == null ? void 0 : data.results) || data || [];
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error("Failed to load chadhawas:", err);
    return [];
  }
};
const useChadhawas = routeLoaderQrl(/* @__PURE__ */ inlinedQrl(s_sbOeuufQyc8, "s_sbOeuufQyc8"));
const s_pmYxrtwAmGg = () => {
  const chadhawasSig = useChadhawas();
  const chadhawas = {
    value: chadhawasSig.value
  };
  return /* @__PURE__ */ _jsxC(Fragment, {
    children: /* @__PURE__ */ _jsxQ("main", null, {
      class: "px-4 md:px-0 max-w-5xl mx-auto relative pt-8 pb-32 min-h-screen bg-[#FDF9F5]"
    }, [
      /* @__PURE__ */ _jsxQ("section", null, {
        class: "w-full px-6 mb-8 bg-gradient-to-b from-primary/10 to-transparent pt-12 pb-8 border-b border-primary/10"
      }, [
        /* @__PURE__ */ _jsxQ("h1", null, {
          class: "font-headline text-4xl md:text-5xl font-black tracking-tight text-on-surface leading-tight mb-4 text-left"
        }, [
          "Sacred ",
          /* @__PURE__ */ _jsxQ("span", null, {
            class: "text-primary italic font-serif tracking-normal"
          }, "Chadhawa", 3, null)
        ], 3, null),
        /* @__PURE__ */ _jsxQ("p", null, {
          class: "text-on-surface-variant text-lg font-medium max-w-lg mb-8 text-left border-l-4 border-primary/30 pl-4"
        }, "Offer blessed Chadhawa and Prasad to the deities across prominent temples in India.", 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "flex flex-col gap-4 text-base font-bold text-on-surface-variant max-w-md w-full"
        }, [
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "flex items-center justify-start gap-3"
          }, [
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "material-symbols-outlined text-primary text-2xl flex-shrink-0",
              style: "font-variation-settings: 'FILL' 1"
            }, "local_florist", 3, null),
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "text-left leading-tight"
            }, "Authentic Temple Offerings", 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "flex items-center justify-start gap-3"
          }, [
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "material-symbols-outlined text-primary text-2xl flex-shrink-0",
              style: "font-variation-settings: 'FILL' 1"
            }, "assignment_ind", 3, null),
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "text-left leading-tight"
            }, "Offered in Your Name-Gotra", 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "flex items-center justify-start gap-3"
          }, [
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "material-symbols-outlined text-primary text-2xl flex-shrink-0",
              style: "font-variation-settings: 'FILL' 1"
            }, "redeem", 3, null),
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "text-left leading-tight"
            }, "Video Proof Shared & Prasad Delivery", 3, null)
          ], 3, null)
        ], 3, null)
      ], 3, null),
      /* @__PURE__ */ _jsxQ("section", null, {
        class: "px-4 md:px-6"
      }, /* @__PURE__ */ _jsxQ("div", null, {
        class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      }, [
        chadhawas.value.length === 0 && /* @__PURE__ */ _jsxQ("div", null, {
          class: "col-span-full py-16 text-center text-on-surface-variant bg-surface-container rounded-3xl border border-dashed border-outline-variant/50"
        }, [
          /* @__PURE__ */ _jsxQ("span", null, {
            class: "material-symbols-outlined text-5xl mb-3 opacity-50"
          }, "search_off", 3, null),
          /* @__PURE__ */ _jsxQ("p", null, {
            class: "font-bold"
          }, "No Chadhawas found at this moment.", 3, null)
        ], 3, "J4_1"),
        chadhawas.value.map((item) => {
          var _a;
          const id = item.id;
          const title = item.name || "Sacred Offering";
          const image = item.image_url || ((_a = item.images) == null ? void 0 : _a[0]) || item.png_default_image || "https://images.unsplash.com/photo-1604068545831-7e8717a03009?auto=format&fit=crop&q=80&w=800";
          let price = item.price || null;
          if (!price && item.offeringDetails && Array.isArray(item.offeringDetails) && item.offeringDetails.length > 0) {
            price = Math.min(...item.offeringDetails.map((p) => parseInt(p.price) || Infinity));
            if (price === Infinity) price = null;
          }
          if (!price && item.packages && Array.isArray(item.packages) && item.packages.length > 0) price = Math.min(...item.packages.map((p) => p.price));
          const mandirName = item.mandir_name;
          const fullLocation = [
            mandirName,
            item.location
          ].filter(Boolean).join(", ") || "Remote / Online";
          const isVip = !!item.vip;
          const benefits = item.benefits ? item.benefits.split(",").map((b) => b.trim()).filter(Boolean) : [];
          const startingAtDate = item.startingAt ? new Date(item.startingAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
          }) : null;
          return /* @__PURE__ */ _jsxQ("div", {
            onClick$: /* @__PURE__ */ _noopQrl("s_x1fOv0Wbm74", [
              id
            ])
          }, {
            class: "bg-white rounded-2xl overflow-hidden shadow-lg shadow-primary/5 flex flex-col border border-outline-variant/20 hover:border-primary/40 hover:-translate-y-1 transition-all cursor-pointer group"
          }, [
            /* @__PURE__ */ _jsxQ("div", null, {
              class: "h-56 relative bg-white flex items-center justify-center p-2 border-b border-outline-variant/20"
            }, [
              /* @__PURE__ */ _jsxQ("img", {
                alt: title,
                src: image
              }, {
                class: "w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-xl"
              }, null, 3, null),
              /* @__PURE__ */ _jsxQ("div", null, {
                class: "absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm border border-primary/10"
              }, "Live Puja", 3, null),
              isVip && /* @__PURE__ */ _jsxQ("div", null, {
                class: "absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-md flex items-center gap-1"
              }, [
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "material-symbols-outlined text-[12px]"
                }, "workspace_premium", 3, null),
                "VIP"
              ], 3, "J4_2")
            ], 1, null),
            /* @__PURE__ */ _jsxQ("div", null, {
              class: "p-5 flex flex-col flex-1 gap-2"
            }, [
              /* @__PURE__ */ _jsxQ("h3", null, {
                class: "font-headline text-lg font-bold text-on-surface leading-snug"
              }, title, 1, null),
              item.tithi && /* @__PURE__ */ _jsxQ("div", null, {
                class: "inline-block bg-primary/5 border border-primary/20 px-2 py-0.5 rounded text-[11px] uppercase font-bold tracking-wider text-primary self-start"
              }, _wrapSignal(item, "tithi"), 1, "J4_3"),
              startingAtDate && /* @__PURE__ */ _jsxQ("div", null, {
                class: "flex items-center gap-1.5 text-on-surface-variant mt-1"
              }, [
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "material-symbols-outlined text-[16px]"
                }, "calendar_today", 3, null),
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "text-xs font-bold"
                }, startingAtDate, 1, null)
              ], 1, "J4_4"),
              /* @__PURE__ */ _jsxQ("div", null, {
                class: "flex items-start gap-1.5 text-on-surface-variant"
              }, [
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "material-symbols-outlined text-[16px] mt-0.5"
                }, "location_on", 3, null),
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "text-xs font-semibold leading-relaxed"
                }, fullLocation, 1, null)
              ], 1, null),
              benefits.length > 0 && /* @__PURE__ */ _jsxQ("div", null, {
                class: "mt-2 text-xs text-on-surface-variant leading-relaxed"
              }, [
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "font-bold text-on-surface"
                }, "Benefits: ", 3, null),
                /* @__PURE__ */ _jsxQ("ul", null, {
                  class: "list-disc list-inside mt-1 space-y-0.5"
                }, benefits.slice(0, 3).map((b, idx) => /* @__PURE__ */ _jsxQ("li", null, {
                  class: "line-clamp-1"
                }, b, 1, idx)), 1, null)
              ], 1, "J4_5"),
              /* @__PURE__ */ _jsxQ("div", null, {
                class: "mt-auto flex items-center justify-between pt-4 border-t border-outline-variant/30"
              }, [
                /* @__PURE__ */ _jsxQ("div", null, null, [
                  /* @__PURE__ */ _jsxQ("span", null, {
                    class: "text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-0.5"
                  }, "Packages From", 3, null),
                  price ? /* @__PURE__ */ _jsxQ("span", null, {
                    class: "font-black text-[17px] text-primary"
                  }, [
                    "₹",
                    price
                  ], 1, "J4_6") : /* @__PURE__ */ _jsxQ("span", null, {
                    class: "font-bold text-sm text-primary"
                  }, "Explore Options", 3, null)
                ], 1, null),
                /* @__PURE__ */ _jsxQ("button", null, {
                  class: "bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
                }, "View Details", 3, null)
              ], 1, null)
            ], 1, null)
          ], 0, id);
        })
      ], 1, null), 1, null)
    ], 1, null)
  }, 1, "J4_7");
};
const index$6 = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_pmYxrtwAmGg, "s_pmYxrtwAmGg"));
const head$6 = {
  title: "DevPunya Marketplace — Devutsav",
  meta: [
    {
      name: "description",
      content: "Book verified Pujas and Chadhawa offerings at India's most prominent temples via DevPunya. Performed by renowned Pandas."
    },
    {
      property: "og:title",
      content: "DevPunya Marketplace — Sacred Pujas & Chadhawas"
    }
  ]
};
const ChadhawaRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index$6,
  head: head$6,
  useChadhawas
}, Symbol.toStringTag, { value: "Module" }));
const ZODIAC_SIGNS = [
  {
    name: "Aries",
    emoji: "♈️"
  },
  {
    name: "Taurus",
    emoji: "♉️"
  },
  {
    name: "Gemini",
    emoji: "♊️"
  },
  {
    name: "Cancer",
    emoji: "♋️"
  },
  {
    name: "Leo",
    emoji: "♌️"
  },
  {
    name: "Virgo",
    emoji: "♍️"
  },
  {
    name: "Libra",
    emoji: "♎️"
  },
  {
    name: "Scorpio",
    emoji: "♏️"
  },
  {
    name: "Sagittarius",
    emoji: "♐️"
  },
  {
    name: "Capricorn",
    emoji: "♑️"
  },
  {
    name: "Aquarius",
    emoji: "♒️"
  },
  {
    name: "Pisces",
    emoji: "♓️"
  }
];
const s_du0B2ITJCjQ = async (sign, time) => {
  const [horoscopeContent, isLoading] = useLexicalScope();
  isLoading.value = true;
  try {
    const apiBase = "http://localhost:5001";
    const res = await fetch(`${apiBase}/api/horoscope?zodiac=${sign}&timeframe=${time}`);
    const data = await res.json();
    if (typeof data.content === "string") horoscopeContent.value = data.content.trim();
    else horoscopeContent.value = "";
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};
const s_C11UueEXTVU = () => {
  var _a;
  const activeSign = useSignal("Aries");
  const timeframe = useSignal("daily");
  const horoscopeContent = useSignal("");
  const isLoading = useSignal(false);
  const showModal = useSignal(false);
  const validationError = useSignal("");
  const form = useStore({
    name: "",
    phone: "",
    dob_y: "",
    dob_m: "",
    dob_d: ""
  });
  const fetchHoroscope = /* @__PURE__ */ inlinedQrl(s_du0B2ITJCjQ, "s_du0B2ITJCjQ", [
    horoscopeContent,
    isLoading
  ]);
  useVisibleTaskQrl(/* @__PURE__ */ _noopQrl("s_yDfWTGdpobU", [
    activeSign,
    fetchHoroscope,
    showModal
  ]));
  return /* @__PURE__ */ _jsxQ("main", null, {
    class: "pb-32 relative bg-[#FDF9F5] min-h-screen"
  }, [
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "bg-surface-container sticky top-0 z-40 shadow-sm border-b border-outline-variant/20 pt-16 pb-4"
    }, /* @__PURE__ */ _jsxQ("div", null, {
      class: "max-w-4xl mx-auto"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "flex justify-center mb-6 px-4"
      }, /* @__PURE__ */ _jsxQ("div", null, {
        class: "flex bg-surface-container-highest rounded-2xl p-1 max-w-sm w-full shadow-inner"
      }, [
        "daily",
        "weekly",
        "monthly"
      ].map((t) => /* @__PURE__ */ _jsxQ("button", {
        class: `flex-1 py-2 text-sm font-bold capitalize rounded-xl transition-all ${timeframe.value === t ? "bg-white text-primary shadow shadow-primary/10" : "text-on-surface-variant hover:text-on-surface"}`,
        onClick$: /* @__PURE__ */ _noopQrl("s_R2FAsEC1XZU", [
          activeSign,
          fetchHoroscope,
          t,
          timeframe
        ])
      }, null, t, 0, t)), 1, null), 1, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "flex overflow-x-auto no-scrollbar gap-3 px-6 pb-2 snap-x"
      }, ZODIAC_SIGNS.map((sign) => /* @__PURE__ */ _jsxQ("button", {
        class: `snap-center shrink-0 flex flex-col items-center justify-center w-[72px] h-[80px] rounded-2xl border-2 transition-all ${activeSign.value === sign.name ? "border-primary bg-primary/5 shadow-md shadow-primary/10" : "border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40"}`,
        onClick$: /* @__PURE__ */ _noopQrl("s_6i5eOZd5Jwo", [
          activeSign,
          fetchHoroscope,
          sign,
          timeframe
        ])
      }, null, [
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "text-2xl mb-1"
        }, _wrapSignal(sign, "emoji"), 1, null),
        /* @__PURE__ */ _jsxQ("span", {
          class: `text-[10px] font-bold uppercase tracking-wider ${activeSign.value === sign.name ? "text-primary" : "text-on-surface-variant"}`
        }, null, _wrapSignal(sign, "name"), 1, null)
      ], 0, sign.name)), 1, null)
    ], 1, null), 1, null),
    /* @__PURE__ */ _jsxQ("section", null, {
      class: "px-6 py-10 max-w-4xl mx-auto"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "flex items-center gap-4 mb-10 border-b border-outline-variant/30 pb-6"
      }, [
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-4xl shadow-inner"
        }, ((_a = ZODIAC_SIGNS.find((s) => s.name === activeSign.value)) == null ? void 0 : _a.emoji) || "♈️", 1, null),
        /* @__PURE__ */ _jsxQ("div", null, null, [
          /* @__PURE__ */ _jsxQ("h2", null, {
            class: "font-headline text-3xl font-black text-on-surface uppercase tracking-tight"
          }, _fnSignal((p0) => p0.value, [
            activeSign
          ], "p0.value"), 3, null),
          /* @__PURE__ */ _jsxQ("p", null, {
            class: "text-sm font-bold text-primary tracking-widest uppercase"
          }, [
            _fnSignal((p0) => p0.value, [
              timeframe
            ], "p0.value"),
            " Forecast"
          ], 3, null)
        ], 3, null)
      ], 1, null),
      isLoading.value ? /* @__PURE__ */ _jsxQ("div", null, {
        class: "flex flex-col items-center justify-center py-20 space-y-4"
      }, [
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"
        }, null, 3, null),
        /* @__PURE__ */ _jsxQ("p", null, {
          class: "text-on-surface-variant font-medium animate-pulse"
        }, "Reading the cosmic alignments...", 3, null)
      ], 3, "0d_0") : /* @__PURE__ */ _jsxQ("div", null, {
        class: "mt-2"
      }, !horoscopeContent.value ? /* @__PURE__ */ _jsxQ("div", null, {
        class: "text-center py-10 text-on-surface-variant text-lg font-medium"
      }, "No predictions available at this moment.", 3, "0d_1") : /* @__PURE__ */ _jsxQ("div", null, {
        class: "text-on-surface-variant leading-relaxed text-lg md:text-xl whitespace-pre-wrap"
      }, _fnSignal((p0) => p0.value, [
        horoscopeContent
      ], "p0.value"), 3, null), 1, null)
    ], 1, null),
    showModal.value && /* @__PURE__ */ _jsxQ("div", null, {
      class: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-highest/80 backdrop-blur-sm"
    }, /* @__PURE__ */ _jsxQ("div", null, {
      class: "bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"
      }, null, 3, null),
      /* @__PURE__ */ _jsxQ("h3", null, {
        class: "font-headline text-2xl font-black text-on-surface mb-2"
      }, "Personalize Your Stars", 3, null),
      /* @__PURE__ */ _jsxQ("p", null, {
        class: "text-sm text-on-surface-variant mb-6"
      }, "Connect your cosmic blueprint permanently to your profile.", 3, null),
      validationError.value && /* @__PURE__ */ _jsxQ("p", null, {
        class: "text-xs font-bold text-error bg-error/10 p-2 rounded-lg mb-4"
      }, _fnSignal((p0) => p0.value, [
        validationError
      ], "p0.value"), 3, "0d_2"),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "space-y-4"
      }, [
        /* @__PURE__ */ _jsxQ("div", null, null, [
          /* @__PURE__ */ _jsxQ("label", null, {
            class: "block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1"
          }, "Name", 3, null),
          /* @__PURE__ */ _jsxQ("input", null, {
            value: _fnSignal((p0) => p0.name, [
              form
            ], "p0.name"),
            class: "w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-2.5 outline-none text-sm",
            placeholder: "e.g. Rahul",
            onInput$: /* @__PURE__ */ _noopQrl("s_G60TMtNxoHM", [
              form
            ])
          }, null, 3, null)
        ], 3, null),
        /* @__PURE__ */ _jsxQ("div", null, null, [
          /* @__PURE__ */ _jsxQ("label", null, {
            class: "block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1"
          }, "Phone", 3, null),
          /* @__PURE__ */ _jsxQ("input", null, {
            type: "tel",
            value: _fnSignal((p0) => p0.phone, [
              form
            ], "p0.phone"),
            class: "w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-2.5 outline-none text-sm",
            placeholder: "10 Digits",
            onInput$: /* @__PURE__ */ _noopQrl("s_vn80CsfCVfo", [
              form
            ])
          }, null, 3, null)
        ], 3, null),
        /* @__PURE__ */ _jsxQ("div", null, null, [
          /* @__PURE__ */ _jsxQ("label", null, {
            class: "block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1"
          }, "Date of Birth (Year, Month, Date)", 3, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "flex gap-2"
          }, [
            /* @__PURE__ */ _jsxQ("input", null, {
              type: "number",
              placeholder: "YYYY",
              value: _fnSignal((p0) => p0.dob_y, [
                form
              ], "p0.dob_y"),
              class: "w-1/3 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-2.5 outline-none text-sm text-center",
              onInput$: /* @__PURE__ */ _noopQrl("s_EQmRJZbuhzo", [
                form
              ])
            }, null, 3, null),
            /* @__PURE__ */ _jsxQ("input", null, {
              type: "number",
              placeholder: "MM",
              value: _fnSignal((p0) => p0.dob_m, [
                form
              ], "p0.dob_m"),
              class: "w-1/3 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-2.5 outline-none text-sm text-center",
              onInput$: /* @__PURE__ */ _noopQrl("s_0PJwpMw8GSA", [
                form
              ])
            }, null, 3, null),
            /* @__PURE__ */ _jsxQ("input", null, {
              type: "number",
              placeholder: "DD",
              value: _fnSignal((p0) => p0.dob_d, [
                form
              ], "p0.dob_d"),
              class: "w-1/3 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-2.5 outline-none text-sm text-center",
              onInput$: /* @__PURE__ */ _noopQrl("s_D0hJiql6xKU", [
                form
              ])
            }, null, 3, null)
          ], 3, null)
        ], 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "pt-4 flex flex-col gap-3"
        }, /* @__PURE__ */ _jsxQ("button", null, {
          class: "w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-xl active:scale-95 transition-transform text-sm shadow-lg shadow-primary/20",
          onClick$: /* @__PURE__ */ _noopQrl("s_jBH0Eq5mY1Y", [
            activeSign,
            fetchHoroscope,
            form,
            showModal,
            timeframe,
            validationError
          ])
        }, "Reveal My Horoscope", 3, null), 3, null)
      ], 3, null)
    ], 1, null), 1, "0d_3")
  ], 1, "0d_4");
};
const index$5 = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_C11UueEXTVU, "s_C11UueEXTVU"));
const head$5 = {
  title: "Daily Horoscope — Devutsav",
  meta: [
    {
      name: "description",
      content: "Get your daily, weekly, and monthly horoscope predictions for all zodiac signs. AI-powered spiritual insights on Devutsav."
    },
    {
      property: "og:title",
      content: "Daily Horoscope — Devutsav"
    }
  ]
};
const HoroscopeRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  _auto_ZODIAC_SIGNS: ZODIAC_SIGNS,
  default: index$5,
  head: head$5
}, Symbol.toStringTag, { value: "Module" }));
const LOADING_MSGS = [
  "Aligning the cosmic coordinates…",
  "Charting planetary positions at your birth…",
  "Mapping the twelve houses of your kundali…",
  "Calculating dasha periods and yogas…",
  "Inscribing your birth chart onto the page…",
  "Sealing your Kundali PDF…"
];
const s_EQNjSa2o3iU = async (val) => {
  const [isSearchingPob, pobSuggestions] = useLexicalScope();
  if (val.length < 3) {
    pobSuggestions.value = [];
    return;
  }
  isSearchingPob.value = true;
  try {
    const res = await fetch(`${getApiBase()}/api/location/autocomplete?input=${encodeURIComponent(val)}`);
    pobSuggestions.value = await res.json();
  } catch {
    pobSuggestions.value = [];
  } finally {
    isSearchingPob.value = false;
  }
};
const s_rv4weJaZN9U = async (description, placeId) => {
  const [form, isSearchingPob, pobSuggestions] = useLexicalScope();
  form.pob = description;
  pobSuggestions.value = [];
  isSearchingPob.value = true;
  try {
    const res = await fetch(`${getApiBase()}/api/location/details?place_id=${placeId}`);
    const d = await res.json();
    if (d == null ? void 0 : d.lat) {
      form.pob_lat = d.lat;
      form.pob_lon = d.lng;
    }
  } catch {
  } finally {
    isSearchingPob.value = false;
  }
};
const s_uC0Vtgl1Es4 = async () => {
  var _a;
  const [error, form, loadingMsgIdx, pdfUrl, submitting, userId] = useLexicalScope();
  error.value = "";
  if (!form.name.trim()) {
    error.value = "Name is required.";
    return;
  }
  const phoneClean = form.phone.replace(/\D/g, "");
  if (phoneClean.length < 6) {
    error.value = "A valid phone number is required.";
    return;
  }
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    error.value = "Please enter a valid email or leave it blank.";
    return;
  }
  if (!form.dob) {
    error.value = "Date of birth is required.";
    return;
  }
  if (!form.pob.trim() || form.pob_lat == null || form.pob_lon == null) {
    error.value = "Please pick your place of birth from the suggestions.";
    return;
  }
  const isdClean = (() => {
    const digits = form.isd_code.replace(/\D/g, "");
    return digits ? `+${digits.slice(0, 4)}` : "+91";
  })();
  submitting.value = true;
  loadingMsgIdx.value = 0;
  const interval = setInterval(() => {
    loadingMsgIdx.value = (loadingMsgIdx.value + 1) % LOADING_MSGS.length;
  }, 1400);
  try {
    let session_id = "";
    try {
      session_id = localStorage.getItem("du_session_id") || localStorage.getItem("user_session_id") || "";
    } catch {
    }
    let uid = userId.value || "";
    try {
      const userRes = await fetch(`${getApiBase()}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_session_id: session_id || void 0,
          source: "KUNDALI_GENERATOR",
          name: form.name.trim(),
          isd_code: isdClean,
          phone: phoneClean,
          email: form.email.trim() || void 0,
          dob: form.dob,
          tob: form.tob_unknown ? "Unknown" : form.tob || void 0,
          pob: form.pob.trim(),
          pob_lat: form.pob_lat,
          pob_lon: form.pob_lon
        })
      });
      const userData = await userRes.json();
      if ((_a = userData == null ? void 0 : userData.user) == null ? void 0 : _a._id) {
        uid = userData.user._id;
        userId.value = uid;
        try {
          localStorage.setItem("du_user_id", uid);
          localStorage.setItem("du_user", JSON.stringify({
            id: uid,
            name: form.name.trim(),
            email: form.email.trim() || void 0,
            phone: phoneClean,
            isd_code: isdClean
          }));
        } catch {
        }
      }
    } catch {
    }
    const res = await fetch(`${getApiBase()}/api/kundali/basic-report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: uid || void 0,
        name: form.name.trim(),
        dob: form.dob,
        tob: form.tob_unknown ? void 0 : form.tob || void 0,
        pob: form.pob.trim(),
        pob_lat: form.pob_lat,
        pob_lon: form.pob_lon,
        gender: form.gender
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error((data == null ? void 0 : data.error) || "Failed to generate");
    if (data.pdf_url) pdfUrl.value = data.pdf_url;
    else throw new Error("No PDF returned");
  } catch (e) {
    error.value = (e == null ? void 0 : e.message) || "Could not generate your Kundali. Please try again.";
  } finally {
    clearInterval(interval);
    submitting.value = false;
  }
};
const s_YylhKrqkIFQ = () => {
  const loading = useSignal(true);
  const submitting = useSignal(false);
  const loadingMsgIdx = useSignal(0);
  const error = useSignal("");
  const pdfUrl = useSignal(null);
  const userId = useSignal(null);
  const hasProfile = useSignal(false);
  const form = useStore({
    name: "",
    isd_code: "+91",
    phone: "",
    email: "",
    dob: "",
    tob: "",
    tob_unknown: false,
    pob: "",
    pob_lat: null,
    pob_lon: null,
    gender: "male"
  });
  const pobSuggestions = useSignal([]);
  const isSearchingPob = useSignal(false);
  const fetchPob = /* @__PURE__ */ inlinedQrl(s_EQNjSa2o3iU, "s_EQNjSa2o3iU", [
    isSearchingPob,
    pobSuggestions
  ]);
  const selectPob = /* @__PURE__ */ inlinedQrl(s_rv4weJaZN9U, "s_rv4weJaZN9U", [
    form,
    isSearchingPob,
    pobSuggestions
  ]);
  useVisibleTaskQrl(/* @__PURE__ */ _noopQrl("s_VUVA7Bx85eo", [
    form,
    hasProfile,
    loading,
    userId
  ]));
  const submit = /* @__PURE__ */ inlinedQrl(s_uC0Vtgl1Es4, "s_uC0Vtgl1Es4", [
    error,
    form,
    loadingMsgIdx,
    pdfUrl,
    submitting,
    userId
  ]);
  return /* @__PURE__ */ _jsxQ("main", null, {
    class: "px-4 md:px-0 max-w-3xl mx-auto pt-6 pb-24"
  }, [
    /* @__PURE__ */ _jsxQ("section", null, {
      class: "px-2 md:px-6 mb-8 text-center"
    }, [
      /* @__PURE__ */ _jsxQ("h1", null, {
        class: "font-headline text-3xl md:text-4xl font-black text-on-surface mb-3"
      }, [
        "Generate Your ",
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "text-secondary italic"
        }, "Kundali", 3, null)
      ], 3, null),
      /* @__PURE__ */ _jsxQ("p", null, {
        class: "text-on-surface-variant text-base max-w-xl mx-auto"
      }, "Receive a complete Vedic birth-chart PDF, prepared from your exact birth details.", 3, null)
    ], 3, null),
    loading.value && /* @__PURE__ */ _jsxQ("div", null, {
      class: "flex items-center justify-center py-16"
    }, /* @__PURE__ */ _jsxQ("div", null, {
      class: "w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"
    }, null, 3, null), 3, "s0_0"),
    !loading.value && submitting.value && /* @__PURE__ */ _jsxQ("section", null, {
      class: "px-2 md:px-6 flex flex-col items-center justify-center min-h-[55vh] text-center"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "relative w-36 h-36 mb-8"
      }, [
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "absolute inset-0 rounded-full border-4 border-primary/15"
        }, null, 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "absolute inset-[3px] rounded-full border-b-4 border-l-4 border-primary animate-[spin_2.4s_linear_infinite]"
        }, null, 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "absolute inset-[10px] rounded-full border-t-4 border-r-4 border-secondary animate-[spin_3.6s_linear_infinite_reverse]"
        }, null, 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "absolute inset-[18px] rounded-full border-b-2 border-tertiary/70 animate-[spin_5s_linear_infinite]"
        }, null, 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "absolute inset-0 flex items-center justify-center"
        }, /* @__PURE__ */ _jsxQ("span", null, {
          class: "material-symbols-outlined text-primary text-5xl animate-pulse",
          style: "font-variation-settings: 'FILL' 1"
        }, "stars", 3, null), 3, null)
      ], 3, null),
      /* @__PURE__ */ _jsxQ("p", null, {
        class: "text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-2"
      }, "Generating your Kundali", 3, null),
      /* @__PURE__ */ _jsxQ("h3", null, {
        class: "font-headline text-2xl font-bold text-on-surface mb-4 min-h-[64px] max-w-md leading-snug"
      }, LOADING_MSGS[loadingMsgIdx.value], 1, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "w-56 bg-surface-variant rounded-full h-1.5 overflow-hidden mb-3"
      }, /* @__PURE__ */ _jsxQ("div", {
        style: `width: ${(loadingMsgIdx.value + 1) / LOADING_MSGS.length * 100}%`
      }, {
        class: "h-full bg-gradient-to-r from-primary via-secondary to-tertiary transition-[width] duration-700 ease-out"
      }, null, 3, null), 1, null),
      /* @__PURE__ */ _jsxQ("p", null, {
        class: "text-xs text-on-surface-variant/70 max-w-xs"
      }, "This usually takes 10–20 seconds. Please don't close this tab.", 3, null)
    ], 1, "s0_1"),
    !loading.value && !submitting.value && pdfUrl.value && /* @__PURE__ */ _jsxQ("section", null, {
      class: "bg-surface-container rounded-3xl p-8 text-center border border-primary/20 shadow-xl"
    }, [
      /* @__PURE__ */ _jsxQ("span", null, {
        class: "material-symbols-outlined text-primary text-5xl mb-3",
        style: "font-variation-settings: 'FILL' 1"
      }, "task_alt", 3, null),
      /* @__PURE__ */ _jsxQ("h2", null, {
        class: "font-headline text-2xl font-bold mb-2"
      }, "Your Kundali is ready", 3, null),
      /* @__PURE__ */ _jsxQ("p", null, {
        class: "text-on-surface-variant mb-6"
      }, "Open it below to view or download your personalised birth-chart PDF.", 3, null),
      /* @__PURE__ */ _jsxQ("a", null, {
        href: _fnSignal((p0) => p0.value, [
          pdfUrl
        ], "p0.value"),
        target: "_blank",
        rel: "noopener noreferrer",
        class: "inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold text-sm rounded-xl uppercase tracking-widest"
      }, [
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "material-symbols-outlined text-base"
        }, "picture_as_pdf", 3, null),
        "Open Kundali PDF"
      ], 3, null)
    ], 3, "s0_2"),
    !loading.value && !submitting.value && !pdfUrl.value && /* @__PURE__ */ _jsxQ("section", null, {
      class: "bg-surface-container rounded-3xl p-6 md:p-8 border border-outline-variant/10"
    }, [
      hasProfile.value && /* @__PURE__ */ _jsxQ("p", null, {
        class: "text-xs font-bold uppercase tracking-widest text-primary mb-4"
      }, "We've pre-filled what we know about you — confirm or edit below.", 3, "s0_3"),
      error.value && /* @__PURE__ */ _jsxQ("div", null, {
        class: "bg-error/10 text-error text-sm font-bold px-4 py-3 rounded-xl mb-4"
      }, _fnSignal((p0) => p0.value, [
        error
      ], "p0.value"), 3, "s0_4"),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "space-y-4"
      }, [
        /* @__PURE__ */ _jsxQ("div", null, null, [
          /* @__PURE__ */ _jsxQ("label", null, {
            class: "block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1"
          }, "Name *", 3, null),
          /* @__PURE__ */ _jsxQ("input", null, {
            value: _fnSignal((p0) => p0.name, [
              form
            ], "p0.name"),
            class: "w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm",
            placeholder: "Your full name",
            onInput$: /* @__PURE__ */ _noopQrl("s_0u0GqN9hMYs", [
              form
            ])
          }, null, 3, null)
        ], 3, null),
        /* @__PURE__ */ _jsxQ("div", null, null, [
          /* @__PURE__ */ _jsxQ("label", null, {
            class: "block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1"
          }, "Phone *", 3, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "flex gap-2"
          }, [
            /* @__PURE__ */ _jsxQ("input", null, {
              type: "tel",
              value: _fnSignal((p0) => p0.isd_code, [
                form
              ], "p0.isd_code"),
              class: "w-20 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-3 py-3 outline-none text-sm text-center font-bold",
              placeholder: "+91",
              "aria-label": "Country code",
              onInput$: /* @__PURE__ */ _noopQrl("s_W09cEvlb78w", [
                form
              ])
            }, null, 3, null),
            /* @__PURE__ */ _jsxQ("input", null, {
              type: "tel",
              value: _fnSignal((p0) => p0.phone, [
                form
              ], "p0.phone"),
              class: "flex-1 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm",
              placeholder: "10-digit phone",
              onInput$: /* @__PURE__ */ _noopQrl("s_WQucy0De0cc", [
                form
              ])
            }, null, 3, null)
          ], 3, null)
        ], 3, null),
        /* @__PURE__ */ _jsxQ("div", null, null, [
          /* @__PURE__ */ _jsxQ("label", null, {
            class: "block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1"
          }, [
            "Email ",
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "text-on-surface-variant/60 normal-case font-normal"
            }, "(optional)", 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxQ("input", null, {
            type: "email",
            value: _fnSignal((p0) => p0.email, [
              form
            ], "p0.email"),
            class: "w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm",
            placeholder: "you@example.com",
            onInput$: /* @__PURE__ */ _noopQrl("s_I452021xTxE", [
              form
            ])
          }, null, 3, null)
        ], 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "grid grid-cols-2 gap-3"
        }, [
          /* @__PURE__ */ _jsxQ("div", null, null, [
            /* @__PURE__ */ _jsxQ("label", null, {
              class: "block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1"
            }, "Date of Birth *", 3, null),
            /* @__PURE__ */ _jsxQ("input", null, {
              type: "date",
              value: _fnSignal((p0) => p0.dob, [
                form
              ], "p0.dob"),
              max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
              min: "1900-01-01",
              class: "w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm",
              onInput$: /* @__PURE__ */ _noopQrl("s_iXnugWqO6so", [
                form
              ])
            }, null, 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxQ("div", null, null, [
            /* @__PURE__ */ _jsxQ("label", null, {
              class: "block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1"
            }, "Gender", 3, null),
            /* @__PURE__ */ _jsxQ("select", null, {
              value: _fnSignal((p0) => p0.gender, [
                form
              ], "p0.gender"),
              class: "w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm",
              onChange$: /* @__PURE__ */ _noopQrl("s_3s1O9AtqDnk", [
                form
              ])
            }, [
              /* @__PURE__ */ _jsxQ("option", null, {
                value: "male"
              }, "Male", 3, null),
              /* @__PURE__ */ _jsxQ("option", null, {
                value: "female"
              }, "Female", 3, null)
            ], 3, null)
          ], 3, null)
        ], 3, null),
        /* @__PURE__ */ _jsxQ("div", null, null, [
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "flex items-center justify-between mb-1"
          }, [
            /* @__PURE__ */ _jsxQ("label", null, {
              class: "text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
            }, "Time of Birth", 3, null),
            /* @__PURE__ */ _jsxQ("label", null, {
              class: "flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant cursor-pointer"
            }, [
              /* @__PURE__ */ _jsxQ("input", null, {
                type: "checkbox",
                checked: _fnSignal((p0) => p0.tob_unknown, [
                  form
                ], "p0.tob_unknown"),
                class: "w-3.5 h-3.5 rounded",
                onChange$: /* @__PURE__ */ _noopQrl("s_Uertmc0oTQQ", [
                  form
                ])
              }, null, 3, null),
              /* @__PURE__ */ _jsxQ("span", null, null, "I don't know", 3, null)
            ], 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxQ("input", null, {
            type: "time",
            disabled: _fnSignal((p0) => p0.tob_unknown, [
              form
            ], "p0.tob_unknown"),
            value: _fnSignal((p0) => p0.tob, [
              form
            ], "p0.tob"),
            class: "w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm disabled:opacity-50",
            onInput$: /* @__PURE__ */ _noopQrl("s_pCED6Jxp7zc", [
              form
            ])
          }, null, 3, null)
        ], 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "relative"
        }, [
          /* @__PURE__ */ _jsxQ("label", null, {
            class: "block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1"
          }, "Place of Birth *", 3, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "relative"
          }, [
            /* @__PURE__ */ _jsxQ("input", null, {
              type: "text",
              value: _fnSignal((p0) => p0.pob, [
                form
              ], "p0.pob"),
              placeholder: "e.g. Varanasi, India",
              autoComplete: "off",
              class: "w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm",
              onInput$: /* @__PURE__ */ _noopQrl("s_gO4bG3ON3UI", [
                fetchPob,
                form
              ])
            }, null, 3, null),
            isSearchingPob.value && /* @__PURE__ */ _jsxQ("div", null, {
              class: "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"
            }, null, 3, "s0_5")
          ], 1, null),
          /* @__PURE__ */ _jsxQ("p", null, {
            class: "text-[10px] text-on-surface-variant/60 mt-1"
          }, "Pick the matching city from the list", 3, null),
          pobSuggestions.value.length > 0 && /* @__PURE__ */ _jsxQ("div", null, {
            class: "absolute top-[68px] left-0 right-0 bg-white border border-outline-variant/30 rounded-xl shadow-2xl z-30 overflow-hidden max-h-52 overflow-y-auto"
          }, pobSuggestions.value.map((p, idx) => /* @__PURE__ */ _jsxQ("div", {
            onClick$: /* @__PURE__ */ _noopQrl("s_5eFcKkjLFbA", [
              p,
              selectPob
            ])
          }, {
            class: "px-4 py-3 hover:bg-surface-variant border-b border-outline-variant/10 cursor-pointer text-sm font-medium text-on-surface"
          }, _wrapSignal(p, "description"), 0, idx)), 1, "s0_6"),
          hasProfile.value && form.pob_lat == null && form.pob && /* @__PURE__ */ _jsxQ("p", null, {
            class: "text-[10px] text-error mt-1"
          }, "Please reselect your city from the suggestions to confirm coordinates.", 3, "s0_7")
        ], 1, null),
        /* @__PURE__ */ _jsxQ("button", null, {
          disabled: _fnSignal((p0) => p0.value, [
            submitting
          ], "p0.value"),
          class: "w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl active:scale-95 transition-transform text-sm uppercase tracking-widest disabled:opacity-60",
          onClick$: submit
        }, _fnSignal((p0) => p0.value ? "Generating your Kundali…" : "Generate Kundali PDF", [
          submitting
        ], 'p0.value?"Generating your Kundali…":"Generate Kundali PDF"'), 3, null),
        /* @__PURE__ */ _jsxQ("p", null, {
          class: "text-[10px] text-on-surface-variant/60 text-center"
        }, "Free · Delivered as a PDF you can save", 3, null)
      ], 1, null)
    ], 1, "s0_8")
  ], 1, "s0_9");
};
const index$4 = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_YylhKrqkIFQ, "s_YylhKrqkIFQ"));
const head$4 = {
  title: "Generate Your Kundali — Devutsav",
  meta: [
    {
      name: "description",
      content: "Generate a personalised Vedic Kundali PDF from your birth details — instantly delivered on Devutsav."
    },
    {
      property: "og:title",
      content: "Generate Your Kundali — Devutsav"
    }
  ]
};
const KundaliRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  _auto_LOADING_MSGS: LOADING_MSGS,
  default: index$4,
  head: head$4
}, Symbol.toStringTag, { value: "Module" }));
const s_4EtU4mS0B6E = async () => {
  var _a;
  try {
    const res = await fetch(`${getApiBase()}/api/market/pujas`);
    const data = await res.json();
    const list = ((_a = data == null ? void 0 : data.results) == null ? void 0 : _a.data) || (data == null ? void 0 : data.results) || data || [];
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error("Failed to load pujas:", err);
    return [];
  }
};
const usePujas = routeLoaderQrl(/* @__PURE__ */ inlinedQrl(s_4EtU4mS0B6E, "s_4EtU4mS0B6E"));
const s_wl0qVHboYsQ = () => {
  const pujasSig = usePujas();
  const pujas = {
    value: pujasSig.value
  };
  return /* @__PURE__ */ _jsxC(Fragment, {
    children: /* @__PURE__ */ _jsxQ("main", null, {
      class: "px-4 md:px-0 max-w-5xl mx-auto relative pt-8 pb-32 min-h-screen bg-[#FDF9F5]"
    }, [
      /* @__PURE__ */ _jsxQ("section", null, {
        class: "w-full px-6 mb-8 bg-gradient-to-b from-primary/10 to-transparent pt-12 pb-8 border-b border-primary/10"
      }, [
        /* @__PURE__ */ _jsxQ("h1", null, {
          class: "font-headline text-4xl md:text-5xl font-black tracking-tight text-on-surface leading-tight mb-4 text-left"
        }, [
          "Sacred ",
          /* @__PURE__ */ _jsxQ("span", null, {
            class: "text-primary italic font-serif tracking-normal"
          }, "Pujas", 3, null)
        ], 3, null),
        /* @__PURE__ */ _jsxQ("p", null, {
          class: "text-on-surface-variant text-lg font-medium max-w-lg mb-8 text-left border-l-4 border-primary/30 pl-4"
        }, "Book auspicious rituals across India's most prominent temples.", 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "flex flex-col gap-4 text-base font-bold text-on-surface-variant max-w-md w-full"
        }, [
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "flex items-center justify-start gap-3"
          }, [
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "material-symbols-outlined text-primary text-2xl flex-shrink-0",
              style: "font-variation-settings: 'FILL' 1"
            }, "verified", 3, null),
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "text-left leading-tight"
            }, "Puja Performed by Vedic Pandits", 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "flex items-center justify-start gap-3"
          }, [
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "material-symbols-outlined text-primary text-2xl flex-shrink-0",
              style: "font-variation-settings: 'FILL' 1"
            }, "assignment_ind", 3, null),
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "text-left leading-tight"
            }, "Puja Complete in Your Name-Gotra", 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "flex items-center justify-start gap-3"
          }, [
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "material-symbols-outlined text-primary text-2xl flex-shrink-0",
              style: "font-variation-settings: 'FILL' 1"
            }, "featured_video", 3, null),
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "text-left leading-tight"
            }, "Video Proof Shared & Prasad Delivery", 3, null)
          ], 3, null)
        ], 3, null)
      ], 3, null),
      /* @__PURE__ */ _jsxQ("section", null, {
        class: "px-4 md:px-6"
      }, /* @__PURE__ */ _jsxQ("div", null, {
        class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      }, [
        pujas.value.length === 0 && /* @__PURE__ */ _jsxQ("div", null, {
          class: "col-span-full py-16 text-center text-on-surface-variant bg-surface-container rounded-3xl border border-dashed border-outline-variant/50"
        }, [
          /* @__PURE__ */ _jsxQ("span", null, {
            class: "material-symbols-outlined text-5xl mb-3 opacity-50"
          }, "search_off", 3, null),
          /* @__PURE__ */ _jsxQ("p", null, {
            class: "font-bold"
          }, "No Pujas found at this moment.", 3, null)
        ], 3, "Wq_1"),
        pujas.value.map((item) => {
          var _a;
          const id = item.id;
          const title = item.name || "Sacred Ritual";
          const image = ((_a = item.images) == null ? void 0 : _a[0]) || item.png_default_image || item.image_url || "https://images.unsplash.com/photo-1604068545831-7e8717a03009?auto=format&fit=crop&q=80&w=800";
          let price = item.price || null;
          if (item.packages && Array.isArray(item.packages) && item.packages.length > 0) price = Math.min(...item.packages.map((p) => p.price));
          const mandirName = item.mandir_name;
          const fullLocation = [
            mandirName,
            item.location
          ].filter(Boolean).join(", ") || "Remote / Online";
          const isVip = !!item.vip;
          const benefits = item.benefits ? item.benefits.split(",").map((b) => b.trim()).filter(Boolean) : [];
          const startingAtDate = item.startingAt ? new Date(item.startingAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
          }) : null;
          return /* @__PURE__ */ _jsxQ("div", {
            onClick$: /* @__PURE__ */ _noopQrl("s_OM2LZefYofI", [
              id
            ])
          }, {
            class: "bg-white rounded-2xl overflow-hidden shadow-lg shadow-primary/5 flex flex-col border border-outline-variant/20 hover:border-primary/40 hover:-translate-y-1 transition-all cursor-pointer group"
          }, [
            /* @__PURE__ */ _jsxQ("div", null, {
              class: "h-56 relative bg-white flex items-center justify-center p-2 border-b border-outline-variant/20"
            }, [
              /* @__PURE__ */ _jsxQ("img", {
                alt: title,
                src: image
              }, {
                class: "w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-xl"
              }, null, 3, null),
              /* @__PURE__ */ _jsxQ("div", null, {
                class: "absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm border border-primary/10"
              }, "Live Puja", 3, null),
              isVip && /* @__PURE__ */ _jsxQ("div", null, {
                class: "absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-md flex items-center gap-1"
              }, [
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "material-symbols-outlined text-[12px]"
                }, "workspace_premium", 3, null),
                "VIP"
              ], 3, "Wq_2")
            ], 1, null),
            /* @__PURE__ */ _jsxQ("div", null, {
              class: "p-5 flex flex-col flex-1 gap-2"
            }, [
              /* @__PURE__ */ _jsxQ("h3", null, {
                class: "font-headline text-lg font-bold text-on-surface leading-snug"
              }, title, 1, null),
              item.tithi && /* @__PURE__ */ _jsxQ("div", null, {
                class: "inline-block bg-primary/5 border border-primary/20 px-2 py-0.5 rounded text-[11px] uppercase font-bold tracking-wider text-primary self-start"
              }, _wrapSignal(item, "tithi"), 1, "Wq_3"),
              startingAtDate && /* @__PURE__ */ _jsxQ("div", null, {
                class: "flex items-center gap-1.5 text-on-surface-variant mt-1"
              }, [
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "material-symbols-outlined text-[16px]"
                }, "calendar_today", 3, null),
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "text-xs font-bold"
                }, startingAtDate, 1, null)
              ], 1, "Wq_4"),
              /* @__PURE__ */ _jsxQ("div", null, {
                class: "flex items-start gap-1.5 text-on-surface-variant"
              }, [
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "material-symbols-outlined text-[16px] mt-0.5"
                }, "location_on", 3, null),
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "text-xs font-semibold leading-relaxed"
                }, fullLocation, 1, null)
              ], 1, null),
              benefits.length > 0 && /* @__PURE__ */ _jsxQ("div", null, {
                class: "mt-2 text-xs text-on-surface-variant leading-relaxed"
              }, [
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "font-bold text-on-surface"
                }, "Benefits: ", 3, null),
                /* @__PURE__ */ _jsxQ("ul", null, {
                  class: "list-disc list-inside mt-1 space-y-0.5"
                }, benefits.slice(0, 3).map((b, idx) => /* @__PURE__ */ _jsxQ("li", null, {
                  class: "line-clamp-1"
                }, b, 1, idx)), 1, null)
              ], 1, "Wq_5"),
              /* @__PURE__ */ _jsxQ("div", null, {
                class: "mt-auto flex items-center justify-between pt-4 border-t border-outline-variant/30"
              }, [
                /* @__PURE__ */ _jsxQ("div", null, null, [
                  /* @__PURE__ */ _jsxQ("span", null, {
                    class: "text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-0.5"
                  }, "Packages From", 3, null),
                  price ? /* @__PURE__ */ _jsxQ("span", null, {
                    class: "font-black text-[17px] text-primary"
                  }, [
                    "₹",
                    price
                  ], 1, "Wq_6") : /* @__PURE__ */ _jsxQ("span", null, {
                    class: "font-bold text-sm text-primary"
                  }, "Explore Options", 3, null)
                ], 1, null),
                /* @__PURE__ */ _jsxQ("button", null, {
                  class: "bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
                }, "View Details", 3, null)
              ], 1, null)
            ], 1, null)
          ], 0, id);
        })
      ], 1, null), 1, null)
    ], 1, null)
  }, 1, "Wq_7");
};
const index$3 = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_wl0qVHboYsQ, "s_wl0qVHboYsQ"));
const head$3 = {
  title: "DevPunya Marketplace — Devutsav",
  meta: [
    {
      name: "description",
      content: "Book verified Pujas and Chadhawa offerings at India's most prominent temples via DevPunya. Performed by renowned Pandas."
    },
    {
      property: "og:title",
      content: "DevPunya Marketplace — Sacred Pujas & Chadhawas"
    }
  ]
};
const PujaRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index$3,
  head: head$3,
  usePujas
}, Symbol.toStringTag, { value: "Module" }));
const s_Nc7RjMx870k = () => {
  return /* @__PURE__ */ _jsxQ("main", null, {
    class: "px-4 md:px-0 max-w-5xl mx-auto relative pt-6"
  }, [
    /* @__PURE__ */ _jsxQ("section", null, {
      class: "flex flex-col md:flex-row gap-12 mb-20 items-end"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "w-full md:w-1/2 order-2 md:order-1"
      }, [
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "flex gap-2 mb-4"
        }, [
          /* @__PURE__ */ _jsxQ("span", null, {
            class: "px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold uppercase tracking-widest rounded-full"
          }, "Daily Ritual", 3, null),
          /* @__PURE__ */ _jsxQ("span", null, {
            class: "px-3 py-1 bg-surface-container-highest text-primary text-[10px] font-bold uppercase tracking-widest rounded-full"
          }, "12 Min Read", 3, null)
        ], 3, null),
        /* @__PURE__ */ _jsxQ("h1", null, {
          class: "font-headline text-5xl md:text-7xl leading-tight text-on-background font-bold tracking-tight mb-6"
        }, [
          "The Sacred ",
          /* @__PURE__ */ _jsxQ("span", null, {
            class: "text-secondary"
          }, "Ganesh", 3, null),
          " Vandana"
        ], 3, null),
        /* @__PURE__ */ _jsxQ("p", null, {
          class: "text-lg text-on-surface-variant leading-relaxed max-w-md"
        }, "Invoking the Lord of Obstacles to clear your path toward spiritual clarity and material prosperity. A guide for your daily morning practice.", 3, null)
      ], 3, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "w-full md:w-1/2 order-1 md:order-2"
      }, /* @__PURE__ */ _jsxQ("div", null, {
        class: "relative group"
      }, [
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "absolute -inset-4 bg-primary/5 rounded-3xl -rotate-2 group-hover:rotate-0 transition-transform duration-500"
        }, null, 3, null),
        /* @__PURE__ */ _jsxQ("img", null, {
          class: "w-full h-[300px] md:h-[500px] object-cover rounded-2xl relative z-10 asymmetric-image shadow-xl",
          alt: "Ganesh Ritual",
          width: 800,
          height: 500,
          loading: "lazy",
          decoding: "async",
          src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFN-2QJr8sQWVkIYuAsASJHC48a0aFcc5q6vY31MPeG4i3zYvYIMR5G0ci6U12kFVvZV8iDvBsjaJ97tZG4Eabe8dXj6BJuPgJzeXBGMBOqR-YyAPzzNHZqIIxEyNuIYApwY74XL51nGYVlTUv2IKvXqgHyXevtIyKv6ibpoQReZdYH_oBjZBIDdpmyFT5F3J4ZXUmRTY4gRBRDPMivszaPp2g8ASDXXFJ-l944epo-TrEmgSiCjd2iae61RBeUmB92JxPyJ_wPEoi"
        }, null, 3, null)
      ], 3, null), 3, null)
    ], 3, null),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "grid grid-cols-1 md:grid-cols-12 gap-8 mb-20"
    }, [
      /* @__PURE__ */ _jsxQ("article", null, {
        class: "md:col-span-8 space-y-12"
      }, /* @__PURE__ */ _jsxQ("section", null, {
        class: "bg-surface-container-low p-8 md:p-12 rounded-3xl relative overflow-hidden"
      }, [
        /* @__PURE__ */ _jsxQ("h2", null, {
          class: "font-headline text-2xl font-bold mb-6 flex items-center gap-3"
        }, [
          /* @__PURE__ */ _jsxQ("span", null, {
            class: "w-8 h-[2px] bg-primary"
          }, null, 3, null),
          " Step 1: Purification"
        ], 3, null),
        /* @__PURE__ */ _jsxQ("p", null, {
          class: "text-on-surface-variant text-lg leading-relaxed mb-6"
        }, [
          "Before beginning, wash your hands and face. Sit in a comfortable cross-legged position facing East or North. Light a single ",
          /* @__PURE__ */ _jsxQ("span", null, {
            class: "text-primary font-bold"
          }, "Pure Ghee Diya", 3, null),
          " to represent the inner light of consciousness."
        ], 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "bg-surface-container p-6 rounded-2xl border-l-4 border-primary"
        }, /* @__PURE__ */ _jsxQ("p", null, {
          class: "italic font-headline text-on-surface"
        }, '"Om Gan Ganapataye Namo Namah. Shri Siddhivinayak Namo Namah..."', 3, null), 3, null)
      ], 3, null), 3, null),
      /* @__PURE__ */ _jsxQ("aside", null, {
        class: "md:col-span-4 space-y-8"
      }, /* @__PURE__ */ _jsxQ("div", null, {
        class: "sticky top-24 bg-surface-container-high p-8 rounded-[2.5rem] shadow-sm"
      }, [
        /* @__PURE__ */ _jsxQ("h3", null, {
          class: "font-headline text-xl font-bold mb-2"
        }, "Shop this Ritual", 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "space-y-6 mt-6"
        }, /* @__PURE__ */ _jsxQ("div", null, {
          class: "flex gap-4 group cursor-pointer"
        }, [
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "w-20 h-20 flex-shrink-0 bg-surface rounded-2xl overflow-hidden relative"
          }, /* @__PURE__ */ _jsxQ("img", null, {
            class: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500",
            alt: "Brass Ganesha Idol",
            width: 80,
            height: 80,
            loading: "lazy",
            decoding: "async",
            src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdc6ZmGOaJaN3aiGvuzoqKPAq5ks81YxESd4-E4jaXB-6Eja4C34M_peWesImeKxvUD_eQpdrGso3Dzj_wE8OJyDeKT4g4oKsu4od9q2R7vI9kSu6mpsYhYlY1EebP5fiy9Vf8dgsd_zMsBEWp3IfSoLVQ3AW-Ga2caqZzHwVUC0kaaSyOoI2LT5SuoTLJN7ii-ShoIXdCtTFxNqx8r8EN9dccYeJ6_pS4tAJzisrkT5aIYFraLzh92-VP4VinsfwNRa1NPcnuO-mz"
          }, null, 3, null), 3, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "flex flex-col justify-center"
          }, [
            /* @__PURE__ */ _jsxQ("h4", null, {
              class: "font-bold text-sm text-on-surface leading-tight"
            }, "Brass Ganesha Idol", 3, null),
            /* @__PURE__ */ _jsxQ("p", null, {
              class: "text-secondary font-bold text-lg mt-1"
            }, "$45.00", 3, null)
          ], 3, null)
        ], 3, null), 3, null),
        /* @__PURE__ */ _jsxQ("button", null, {
          class: "w-full mt-10 py-4 bg-gradient-to-br from-[#8f4e00] to-[#ff9933] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity active:scale-[0.98]"
        }, "Buy Entire Kit ($65.50)", 3, null)
      ], 3, null), 3, null)
    ], 3, null)
  ], 3, "jP_0");
};
const index$2 = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_Nc7RjMx870k, "s_Nc7RjMx870k"));
const head$2 = {
  title: "Sacred Ganesh Vandana Ritual Guide — Devutsav",
  meta: [
    {
      name: "description",
      content: "A step-by-step guide to performing the Sacred Ganesh Vandana ritual for spiritual clarity and prosperity."
    },
    {
      property: "og:title",
      content: "Sacred Ganesh Vandana — Devutsav Ritual Guide"
    }
  ]
};
const RitualguideRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index$2,
  head: head$2
}, Symbol.toStringTag, { value: "Module" }));
const s_8TxvwfMKjh4 = () => {
  const step = useSignal(1);
  const isRecording = useSignal(false);
  const audioDataUrl = useSignal(null);
  const validationError = useSignal("");
  const sessionId = useSignal("");
  const mediaRecorderRef = useSignal(null);
  const audioChunks = useSignal([]);
  const form = useStore({
    name: "",
    isd_code: "+91",
    phone: "",
    wish_text: ""
  });
  useVisibleTaskQrl(/* @__PURE__ */ _noopQrl("s_sDBQIXx6Kf8", [
    sessionId
  ]));
  return /* @__PURE__ */ _jsxQ("main", null, {
    class: "pb-32 relative bg-[#FDF9F5] min-h-screen"
  }, [
    step.value === 1 && /* @__PURE__ */ _jsxC(Fragment, {
      children: [
        /* @__PURE__ */ _jsxQ("section", null, {
          class: "relative h-[400px] md:h-[500px] w-full overflow-hidden"
        }, [
          /* @__PURE__ */ _jsxQ("img", null, {
            alt: "Sacred Nandi",
            class: "absolute inset-0 w-full h-full object-cover object-top",
            width: 800,
            height: 500,
            loading: "lazy",
            decoding: "async",
            src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnR6FN-tLR55kZzBGt6Rh3hrntlALyMrZHeKhr8F3FCTMp-fiJzUwH37SqW6IFFk8401bmr7bzTmeqY_b2WUWeJXUUAdDdF-C2TJZfOZPOlz3ujJPPOZFQxhnX17LjK3aagm4FHJPHHF-8snJRDtP6wPnp2qGFqcjr_bq-GEvtafr-xeX6T9V8aI1XDlzudYL7a_ElELohKCIv7nUNulnOqyeLkJYdDCHyG28kzgqut47WT-P5gn8ARh1AnK-NilnD4I0E564y-yF0"
          }, null, 3, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "absolute inset-0 bg-gradient-to-t from-[#FDF9F5] via-[#FDF9F5]/40 to-transparent"
          }, null, 3, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "absolute bottom-10 left-0 right-0 p-6 text-center"
          }, [
            /* @__PURE__ */ _jsxQ("h1", null, {
              class: "font-headline text-4xl md:text-5xl font-black text-on-surface leading-tight mb-2"
            }, [
              "Nandi Whisper ",
              /* @__PURE__ */ _jsxQ("span", null, {
                class: "text-primary italic"
              }, "Ritual", 3, null)
            ], 3, null),
            /* @__PURE__ */ _jsxQ("p", null, {
              class: "font-headline text-lg italic text-on-surface-variant max-w-lg mx-auto"
            }, "Speak your heart to Nandi, the ultimate carrier of wishes to Lord Shiva.", 3, null)
          ], 3, null)
        ], 3, null),
        /* @__PURE__ */ _jsxQ("section", null, {
          class: "max-w-6xl mx-auto w-full mt-8 px-6 pb-24 relative z-10 space-y-12"
        }, [
          /* @__PURE__ */ _jsxQ("div", null, null, [
            /* @__PURE__ */ _jsxQ("h2", null, {
              class: "font-headline text-2xl font-bold text-on-surface mb-6 flex items-center gap-2"
            }, [
              /* @__PURE__ */ _jsxQ("span", null, {
                class: "material-symbols-outlined text-primary"
              }, "person", 3, null),
              " Petitioner Details"
            ], 3, null),
            /* @__PURE__ */ _jsxQ("div", null, {
              class: "grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
            }, [
              /* @__PURE__ */ _jsxQ("div", null, null, [
                /* @__PURE__ */ _jsxQ("label", null, {
                  class: "block text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3"
                }, "Name *", 3, null),
                /* @__PURE__ */ _jsxQ("input", null, {
                  value: _fnSignal((p0) => p0.name, [
                    form
                  ], "p0.name"),
                  class: "w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-6 py-5 text-on-surface text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow",
                  placeholder: "Devotee Name",
                  onInput$: /* @__PURE__ */ _noopQrl("s_vn3ms8Y0PCo", [
                    form
                  ])
                }, null, 3, null)
              ], 3, null),
              /* @__PURE__ */ _jsxQ("div", null, {
                class: "flex gap-4"
              }, [
                /* @__PURE__ */ _jsxQ("div", null, {
                  class: "w-[30%]"
                }, [
                  /* @__PURE__ */ _jsxQ("label", null, {
                    class: "block text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3"
                  }, "ISD", 3, null),
                  /* @__PURE__ */ _jsxQ("input", null, {
                    value: _fnSignal((p0) => p0.isd_code, [
                      form
                    ], "p0.isd_code"),
                    class: "w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-6 py-5 text-on-surface text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow",
                    onInput$: /* @__PURE__ */ _noopQrl("s_J0MTAbpT4sI", [
                      form
                    ])
                  }, null, 3, null)
                ], 3, null),
                /* @__PURE__ */ _jsxQ("div", null, {
                  class: "flex-1"
                }, [
                  /* @__PURE__ */ _jsxQ("label", null, {
                    class: "block text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3"
                  }, "Phone *", 3, null),
                  /* @__PURE__ */ _jsxQ("input", null, {
                    value: _fnSignal((p0) => p0.phone, [
                      form
                    ], "p0.phone"),
                    class: "w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-6 py-5 text-on-surface text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow",
                    placeholder: "10 Digits",
                    onInput$: /* @__PURE__ */ _noopQrl("s_3Wi1njI3fys", [
                      form
                    ])
                  }, null, 3, null)
                ], 3, null)
              ], 3, null)
            ], 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "pt-8 border-t border-outline-variant/20"
          }, [
            /* @__PURE__ */ _jsxQ("h2", null, {
              class: "font-headline text-2xl font-bold text-on-surface mb-6 flex items-center gap-2"
            }, [
              /* @__PURE__ */ _jsxQ("span", null, {
                class: "material-symbols-outlined text-primary"
              }, "record_voice_over", 3, null),
              " Your Wish"
            ], 3, null),
            /* @__PURE__ */ _jsxQ("div", null, {
              class: "space-y-8"
            }, [
              /* @__PURE__ */ _jsxQ("textarea", null, {
                value: _fnSignal((p0) => p0.wish_text, [
                  form
                ], "p0.wish_text"),
                class: "w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/50 rounded-2xl p-6 text-on-surface text-lg outline-none resize-none font-body transition-shadow shadow-sm",
                placeholder: "Type your pure wish here...",
                rows: 4,
                onInput$: /* @__PURE__ */ _noopQrl("s_J8AP2qNTPOM", [
                  form
                ])
              }, null, 3, null),
              /* @__PURE__ */ _jsxQ("div", null, {
                class: "flex items-center justify-center gap-4"
              }, [
                /* @__PURE__ */ _jsxQ("div", null, {
                  class: "h-px bg-outline-variant/30 flex-1"
                }, null, 3, null),
                /* @__PURE__ */ _jsxQ("div", null, {
                  class: "text-sm font-bold text-on-surface-variant uppercase tracking-widest"
                }, "OR RECORD AUDIO", 3, null),
                /* @__PURE__ */ _jsxQ("div", null, {
                  class: "h-px bg-outline-variant/30 flex-1"
                }, null, 3, null)
              ], 3, null),
              /* @__PURE__ */ _jsxQ("div", null, {
                class: "flex flex-col items-center justify-center p-8 bg-surface-container-low rounded-[2rem] border border-outline-variant/20 w-full shadow-sm"
              }, [
                !isRecording.value ? /* @__PURE__ */ _jsxQ("button", null, {
                  class: "w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform text-white hover:opacity-90",
                  onClick$: /* @__PURE__ */ _noopQrl("s_hgeZTgc0IEo", [
                    audioChunks,
                    audioDataUrl,
                    isRecording,
                    mediaRecorderRef
                  ])
                }, /* @__PURE__ */ _jsxQ("span", null, {
                  class: "material-symbols-outlined text-4xl",
                  style: "font-variation-settings: 'FILL' 1"
                }, "mic", 3, null), 3, "Wl_0") : /* @__PURE__ */ _jsxQ("div", null, {
                  class: "relative"
                }, [
                  /* @__PURE__ */ _jsxQ("div", null, {
                    class: "absolute inset-0 bg-error/20 rounded-full animate-ping"
                  }, null, 3, null),
                  /* @__PURE__ */ _jsxQ("button", null, {
                    class: "relative z-10 w-20 h-20 bg-error text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform",
                    onClick$: /* @__PURE__ */ _noopQrl("s_bBim0eGFdMg", [
                      isRecording,
                      mediaRecorderRef
                    ])
                  }, /* @__PURE__ */ _jsxQ("span", null, {
                    class: "material-symbols-outlined text-4xl",
                    style: "font-variation-settings: 'FILL' 1"
                  }, "stop", 3, null), 3, null)
                ], 3, null),
                audioDataUrl.value && !isRecording.value && /* @__PURE__ */ _jsxQ("span", null, {
                  class: "text-sm font-bold text-primary mt-6 flex items-center gap-2 bg-primary/10 px-6 py-2 rounded-full shadow-sm"
                }, [
                  /* @__PURE__ */ _jsxQ("span", null, {
                    class: "material-symbols-outlined text-sm"
                  }, "check_circle", 3, null),
                  " Audio Attached"
                ], 3, "Wl_1"),
                isRecording.value && /* @__PURE__ */ _jsxQ("span", null, {
                  class: "text-sm font-bold text-error mt-6 animate-pulse"
                }, "Recording... Click to Stop", 3, "Wl_2")
              ], 1, null)
            ], 1, null)
          ], 1, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "pt-8 flex justify-end w-full border-t border-outline-variant/20 mt-12"
          }, /* @__PURE__ */ _jsxQ("button", null, {
            class: "px-12 py-5 bg-gradient-to-r from-primary to-primary-container text-white font-bold text-lg rounded-2xl shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-3 uppercase tracking-widest",
            onClick$: /* @__PURE__ */ _noopQrl("s_ifkMxlWByQg", [
              audioDataUrl,
              form,
              sessionId,
              step,
              validationError
            ])
          }, [
            "Transmit Wish to Nandi ",
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "text-2xl"
            }, "🐂", 3, null)
          ], 3, null), 3, null)
        ], 1, null)
      ]
    }, 1, "Wl_3"),
    step.value === 2 && /* @__PURE__ */ _jsxQ("section", null, {
      class: "min-h-[70vh] flex flex-col items-center justify-center px-6 text-center"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "relative w-48 h-48 mb-8 rounded-full overflow-hidden shadow-2xl shadow-primary/20 border-4 border-white"
      }, [
        /* @__PURE__ */ _jsxQ("img", null, {
          alt: "Nandi Listening",
          class: "absolute inset-0 w-full h-full object-cover animate-pulse",
          width: 192,
          height: 192,
          loading: "lazy",
          decoding: "async",
          src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnR6FN-tLR55kZzBGt6Rh3hrntlALyMrZHeKhr8F3FCTMp-fiJzUwH37SqW6IFFk8401bmr7bzTmeqY_b2WUWeJXUUAdDdF-C2TJZfOZPOlz3ujJPPOZFQxhnX17LjK3aagm4FHJPHHF-8snJRDtP6wPnp2qGFqcjr_bq-GEvtafr-xeX6T9V8aI1XDlzudYL7a_ElELohKCIv7nUNulnOqyeLkJYdDCHyG28kzgqut47WT-P5gn8ARh1AnK-NilnD4I0E564y-yF0"
        }, null, 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "absolute inset-0 bg-primary/20 backdrop-blur-[2px]"
        }, null, 3, null)
      ], 3, null),
      /* @__PURE__ */ _jsxQ("h2", null, {
        class: "font-headline text-3xl font-bold text-primary mb-3"
      }, "Nandi is listening...", 3, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "flex justify-center gap-1.5 mb-8"
      }, [
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
        }, null, 3, null),
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "w-2.5 h-2.5 bg-primary rounded-full animate-bounce delay-100"
        }, null, 3, null),
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "w-2.5 h-2.5 bg-primary rounded-full animate-bounce delay-200"
        }, null, 3, null)
      ], 3, null),
      /* @__PURE__ */ _jsxQ("p", null, {
        class: "text-on-surface-variant italic"
      }, "Transmitting your cosmic desire.", 3, null)
    ], 3, "Wl_4"),
    step.value === 3 && /* @__PURE__ */ _jsxQ("section", null, {
      class: "max-w-5xl mx-auto w-full mt-10 px-6 pb-24 space-y-12"
    }, [
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "text-center space-y-4 mb-16 pt-4"
      }, [
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "w-full max-w-5xl h-[300px] md:h-[450px] mx-auto mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/10 border border-outline-variant/30 relative bg-surface-container-highest"
        }, /* @__PURE__ */ _jsxQ("video", null, {
          src: `${"http://localhost:5001"}/public/Video_Caption_Removal_Service_Final.mp4`,
          autoPlay: true,
          loop: true,
          muted: true,
          playsInline: true,
          class: "w-full h-full object-cover absolute inset-0"
        }, null, 3, null), 3, null),
        /* @__PURE__ */ _jsxQ("h2", null, {
          class: "font-headline text-4xl md:text-5xl font-black text-on-surface"
        }, "Your Wish Has Been Received", 3, null),
        /* @__PURE__ */ _jsxQ("p", null, {
          class: "font-body text-xl text-on-surface-variant italic max-w-2xl mx-auto mt-4"
        }, "Nandi is carrying your prayer to Shiva. Trust the process.", 3, null)
      ], 3, null),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-stretch"
      }, [
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "flex flex-col h-full border-b md:border-b-0 md:border-r border-outline-variant/20 pb-12 md:pb-0 md:pr-16"
        }, [
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "flex items-center gap-3 mb-6"
          }, [
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "material-symbols-outlined text-4xl text-secondary"
            }, "psychology", 3, null),
            /* @__PURE__ */ _jsxQ("h3", null, {
              class: "font-headline text-3xl font-bold text-on-surface"
            }, "What Happens Now?", 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "space-y-6 text-on-surface-variant leading-relaxed text-lg mb-10"
          }, [
            /* @__PURE__ */ _jsxQ("p", null, null, [
              "Your wish has become a ",
              /* @__PURE__ */ _jsxQ("strong", null, {
                class: "text-primary font-bold"
              }, "Sankalp", 3, null),
              " — a focused intention."
            ], 3, null),
            /* @__PURE__ */ _jsxQ("p", null, null, "With faith and right action, it begins to shape your path.", 3, null),
            /* @__PURE__ */ _jsxQ("div", null, {
              class: "bg-secondary/10 px-6 py-5 rounded-2xl italic font-medium text-secondary-fixed-dim border border-secondary/10"
            }, "Stay calm. Stay aligned. Keep taking real-world steps.", 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "mt-auto"
          }, [
            /* @__PURE__ */ _jsxQ("div", null, {
              class: "flex items-center gap-3 mb-6"
            }, [
              /* @__PURE__ */ _jsxQ("span", null, {
                class: "material-symbols-outlined text-4xl text-primary"
              }, "self_improvement", 3, null),
              /* @__PURE__ */ _jsxQ("h3", null, {
                class: "font-headline text-3xl font-bold text-on-surface"
              }, "What You Should Do", 3, null)
            ], 3, null),
            /* @__PURE__ */ _jsxQ("div", null, {
              class: "bg-white border border-outline-variant/20 rounded-3xl p-6 shadow-sm"
            }, [
              /* @__PURE__ */ _jsxQ("p", null, {
                class: "text-on-surface-variant font-bold mb-4 uppercase tracking-widest text-sm text-center flex items-center justify-center gap-2"
              }, [
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "w-8 h-px bg-outline-variant/30"
                }, null, 3, null),
                " Chant Mantra ",
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "w-8 h-px bg-outline-variant/30"
                }, null, 3, null)
              ], 3, null),
              /* @__PURE__ */ _jsxQ("ul", null, {
                class: "space-y-3 font-medium text-lg text-primary"
              }, [
                /* @__PURE__ */ _jsxQ("li", null, {
                  class: "flex justify-between items-center bg-surface-container-lowest px-5 py-4 rounded-2xl border border-outline-variant/10 shadow-sm"
                }, [
                  /* @__PURE__ */ _jsxQ("span", null, {
                    class: "font-['Noto_Serif'] italic tracking-wide"
                  }, "Om Nandaye Namaha", 3, null),
                  /* @__PURE__ */ _jsxQ("span", null, {
                    class: "bg-primary/10 text-primary px-3 py-1 rounded-xl text-sm font-black tracking-widest"
                  }, "x1", 3, null)
                ], 3, null),
                /* @__PURE__ */ _jsxQ("li", null, {
                  class: "flex justify-between items-center bg-surface-container-lowest px-5 py-4 rounded-2xl border border-outline-variant/10 shadow-sm"
                }, [
                  /* @__PURE__ */ _jsxQ("span", null, {
                    class: "font-['Noto_Serif'] italic tracking-wide"
                  }, "Om Namah Shivay", 3, null),
                  /* @__PURE__ */ _jsxQ("span", null, {
                    class: "bg-primary/10 text-primary px-3 py-1 rounded-xl text-sm font-black tracking-widest"
                  }, "x5", 3, null)
                ], 3, null)
              ], 3, null)
            ], 3, null)
          ], 3, null)
        ], 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "flex flex-col h-full"
        }, [
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "flex items-center gap-3 mb-6"
          }, [
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "material-symbols-outlined text-4xl text-tertiary"
            }, "local_florist", 3, null),
            /* @__PURE__ */ _jsxQ("h3", null, {
              class: "font-headline text-3xl font-bold text-on-surface"
            }, "Strengthen Your Wish", 3, null)
          ], 3, null),
          /* @__PURE__ */ _jsxQ("p", null, {
            class: "text-on-surface-variant leading-relaxed text-lg mb-8"
          }, "Devotees believe that giving back after asking increases the power of your prayer.", 3, null),
          /* @__PURE__ */ _jsxQ("div", null, {
            class: "mt-auto bg-gradient-to-br from-tertiary/10 to-primary/5 rounded-3xl p-8 border border-tertiary/20 relative overflow-hidden"
          }, [
            /* @__PURE__ */ _jsxQ("div", null, {
              class: "absolute -right-4 -top-4 opacity-10 pointer-events-none"
            }, /* @__PURE__ */ _jsxQ("span", null, {
              class: "text-9xl"
            }, "🐄", 3, null), 3, null),
            /* @__PURE__ */ _jsxQ("h4", null, {
              class: "font-headline text-2xl font-black text-tertiary mb-6 flex items-center gap-2 relative z-10"
            }, [
              /* @__PURE__ */ _jsxQ("span", null, null, "🐄", 3, null),
              " Complete Your Ritual with Gau Seva"
            ], 3, null),
            /* @__PURE__ */ _jsxQ("ul", null, {
              class: "space-y-4 mb-8 relative z-10"
            }, [
              /* @__PURE__ */ _jsxQ("li", null, {
                class: "flex items-start gap-3 text-lg text-on-surface-variant font-medium"
              }, [
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "material-symbols-outlined text-tertiary mt-0.5"
                }, "verified", 3, null),
                " Feed sacred cows on your behalf"
              ], 3, null),
              /* @__PURE__ */ _jsxQ("li", null, {
                class: "flex items-start gap-3 text-lg text-on-surface-variant font-medium"
              }, [
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "material-symbols-outlined text-tertiary mt-0.5"
                }, "verified", 3, null),
                " Done with proper devotion"
              ], 3, null),
              /* @__PURE__ */ _jsxQ("li", null, {
                class: "flex items-start gap-3 text-lg text-on-surface-variant font-medium"
              }, [
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "material-symbols-outlined text-tertiary mt-0.5"
                }, "verified", 3, null),
                " Supports your wish intention"
              ], 3, null)
            ], 3, null),
            /* @__PURE__ */ _jsxQ("div", null, {
              class: "relative z-10 pt-4"
            }, [
              /* @__PURE__ */ _jsxQ("a", null, {
                href: "https://devpunya.com/chadhaava/v2/15?utm_content=DevUtsav&affiliate_id=34180",
                target: "_blank",
                rel: "noopener noreferrer",
                class: "block w-full text-center py-5 bg-gradient-to-r from-tertiary to-tertiary-container text-white font-bold text-xl rounded-2xl shadow-xl hover:-translate-y-1 active:scale-95 transition-transform uppercase tracking-widest"
              }, "👉 Complete My Ritual", 3, null),
              /* @__PURE__ */ _jsxQ("p", null, {
                class: "text-center text-sm text-tertiary font-bold mt-5 flex items-center justify-center gap-2"
              }, [
                /* @__PURE__ */ _jsxQ("span", null, {
                  class: "material-symbols-outlined text-base"
                }, "videocam", 3, null),
                " Receive video proof with your name"
              ], 3, null)
            ], 3, null)
          ], 3, null)
        ], 3, null)
      ], 3, null)
    ], 3, "Wl_5"),
    validationError.value && /* @__PURE__ */ _jsxQ("div", null, {
      class: "fixed bottom-[100px] md:bottom-12 left-1/2 -translate-x-1/2 bg-error text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(182,23,30,0.3)] flex items-center gap-3 z-50"
    }, [
      /* @__PURE__ */ _jsxQ("span", null, {
        class: "material-symbols-outlined text-xl"
      }, "error", 3, null),
      /* @__PURE__ */ _jsxQ("span", null, {
        class: "font-bold text-sm tracking-wide"
      }, _fnSignal((p0) => p0.value, [
        validationError
      ], "p0.value"), 3, null),
      /* @__PURE__ */ _jsxQ("button", null, {
        class: "ml-2 flex items-center hover:bg-white/20 p-1 rounded-full transition-colors",
        onClick$: /* @__PURE__ */ _noopQrl("s_EciWTeockQg", [
          validationError
        ])
      }, /* @__PURE__ */ _jsxQ("span", null, {
        class: "material-symbols-outlined text-lg"
      }, "close", 3, null), 3, null)
    ], 3, "Wl_6")
  ], 1, "Wl_7");
};
const index$1 = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_8TxvwfMKjh4, "s_8TxvwfMKjh4"));
const head$1 = {
  title: "Nandi Whisper Ritual — Devutsav",
  meta: [
    {
      name: "description",
      content: "Transmit your deepest wishes to Lord Shiva through the sacred Nandi Whisper ritual. Record or type your prayer on Devutsav."
    },
    {
      property: "og:title",
      content: "Nandi Whisper Ritual — Devutsav"
    }
  ]
};
const WhisperRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index$1,
  head: head$1
}, Symbol.toStringTag, { value: "Module" }));
const onStaticGenerate = async () => {
  const base = getApiBase();
  const slugs = /* @__PURE__ */ new Set();
  for (const p of blogPosts) slugs.add(p.slug);
  try {
    const res = await fetch(`${base}/api/blogs/posts`, {
      headers: {
        Accept: "application/json"
      }
    });
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : Array.isArray(data == null ? void 0 : data.posts) ? data.posts : [];
      for (const b of list) if ((b == null ? void 0 : b.slug) && (b.status === "PUBLISHED" || !b.status)) slugs.add(b.slug);
    }
  } catch {
  }
  return {
    params: [
      ...slugs
    ].map((slug) => ({
      slug
    }))
  };
};
const s_Gj1pHU4Cfd0 = async ({ params, redirect }) => {
  var _a;
  const raw = params.slug ?? "";
  let slug = String(raw).trim();
  try {
    slug = decodeURIComponent(slug);
  } catch {
  }
  if (!slug) throw redirect(302, "/blog");
  const base = getApiBase();
  let fromApi = null;
  try {
    const res = await fetch(`${base}/api/blogs/post/${encodeURIComponent(slug)}`, {
      headers: {
        Accept: "application/json"
      }
    });
    if (res.ok) {
      const d = await res.json();
      if ((d == null ? void 0 : d.slug) && (d == null ? void 0 : d.title)) fromApi = {
        source: "api",
        slug: d.slug,
        title: d.title,
        excerpt: d.excerpt || "",
        image: d.image || "",
        category: ((_a = d.series_id) == null ? void 0 : _a.name) || "Knowledge hub",
        content_html: d.content_html || "",
        coming_soon: !!d.coming_soon,
        seo_title: d.seo_title,
        seo_description: d.seo_description,
        seo_keywords: d.seo_keywords,
        og_image: d.og_image,
        prev: d.prev || null,
        next: d.next || null
      };
    }
  } catch {
  }
  if (fromApi) return fromApi;
  const legacy = blogPosts.find((p) => p.slug === slug);
  if (legacy) return {
    source: "legacy",
    slug: legacy.slug,
    title: legacy.title,
    excerpt: legacy.excerpt,
    image: legacy.image,
    category: legacy.category,
    content_html: legacy.content,
    coming_soon: false,
    seo_title: legacy.title,
    seo_description: legacy.excerpt,
    og_image: legacy.image,
    seo_keywords: void 0,
    ctaText: legacy.ctaText,
    ctaLink: legacy.ctaLink,
    prev: null,
    next: null
  };
  throw redirect(302, "/blog");
};
const usePost = routeLoaderQrl(/* @__PURE__ */ inlinedQrl(s_Gj1pHU4Cfd0, "s_Gj1pHU4Cfd0"));
const s_lq8DmIU6K08 = () => {
  const post = usePost();
  const showImage = !!post.value.image;
  post.value.seo_title || post.value.title;
  post.value.seo_description || post.value.excerpt;
  post.value.og_image || post.value.image;
  return /* @__PURE__ */ _jsxQ("article", null, {
    class: "px-4 md:px-0 max-w-4xl mx-auto relative pt-6 pb-20"
  }, [
    /* @__PURE__ */ _jsxQ("header", null, {
      class: "mb-10 px-6 mt-4"
    }, [
      /* @__PURE__ */ _jsxC(Link, {
        href: "/blog",
        class: "inline-flex items-center text-primary text-sm font-bold uppercase tracking-widest hover:underline mb-8",
        children: [
          /* @__PURE__ */ _jsxQ("span", null, {
            class: "material-symbols-outlined text-sm mr-2"
          }, "arrow_back", 3, null),
          "Back to hub"
        ],
        [_IMMUTABLE]: {
          href: _IMMUTABLE,
          class: _IMMUTABLE
        }
      }, 3, "FA_0"),
      /* @__PURE__ */ _jsxQ("div", null, {
        class: "flex flex-wrap items-center gap-3 mb-6"
      }, [
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
        }, _fnSignal((p0) => p0.value.category, [
          post
        ], "p0.value.category"), 3, null),
        post.value.coming_soon ? /* @__PURE__ */ _jsxQ("span", null, {
          class: "bg-amber-500/15 text-amber-900 dark:text-amber-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-amber-500/30"
        }, "Coming soon", 3, "FA_1") : null,
        /* @__PURE__ */ _jsxQ("span", null, {
          class: "text-on-surface-variant text-sm font-label"
        }, "Spiritual read", 3, null)
      ], 1, null),
      /* @__PURE__ */ _jsxQ("h1", null, {
        class: "font-headline text-3xl md:text-5xl font-bold text-on-surface leading-tight mb-6"
      }, _fnSignal((p0) => p0.value.title, [
        post
      ], "p0.value.title"), 3, null),
      /* @__PURE__ */ _jsxQ("p", null, {
        class: "text-on-surface-variant text-lg md:text-xl font-body leading-relaxed max-w-2xl mb-8"
      }, _fnSignal((p0) => p0.value.excerpt, [
        post
      ], "p0.value.excerpt"), 3, null),
      showImage ? /* @__PURE__ */ _jsxQ("div", null, {
        class: "w-full aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden shadow-xl shadow-surface-container-high relative"
      }, [
        /* @__PURE__ */ _jsxQ("img", null, {
          src: _fnSignal((p0) => p0.value.image, [
            post
          ], "p0.value.image"),
          alt: "",
          class: "w-full h-full object-cover"
        }, null, 3, null),
        /* @__PURE__ */ _jsxQ("div", null, {
          class: "absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent"
        }, null, 3, null)
      ], 3, "FA_2") : null
    ], 1, null),
    /* @__PURE__ */ _jsxQ("div", null, {
      class: "px-6 relative"
    }, [
      post.value.coming_soon ? /* @__PURE__ */ _jsxQ("div", null, {
        class: "mb-10 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-5 text-on-surface"
      }, [
        /* @__PURE__ */ _jsxQ("p", null, {
          class: "font-headline font-bold text-lg mb-1"
        }, "Full article coming soon", 3, null),
        /* @__PURE__ */ _jsxQ("p", null, {
          class: "text-sm text-on-surface-variant"
        }, "We are preparing this piece. Explore other articles in the Knowledge Hub.", 3, null)
      ], 3, "FA_3") : null,
      !post.value.coming_soon && post.value.content_html ? /* @__PURE__ */ _jsxQ("div", null, {
        class: "prose prose-lg md:prose-xl max-w-none prose-headings:font-headline prose-headings:font-bold prose-headings:text-on-surface prose-h2:mt-10 prose-h2:mb-4 prose-h3:mt-8 prose-h3:mb-3 prose-p:text-on-surface-variant prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-li:text-on-surface-variant prose-strong:text-on-surface prose-blockquote:not-italic prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-primary/5 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-2xl prose-blockquote:text-on-surface prose-hr:border-outline-variant/30 prose-hr:my-10 prose-img:rounded-2xl prose-figure:my-8 prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-on-surface-variant prose-aside:border prose-aside:border-outline-variant/25 prose-aside:bg-surface-container-low prose-aside:rounded-2xl prose-aside:px-5 prose-aside:py-4 prose-aside:text-sm",
        dangerouslySetInnerHTML: _fnSignal((p0) => p0.value.content_html, [
          post
        ], "p0.value.content_html")
      }, null, 3, "FA_4") : null,
      !post.value.coming_soon && post.value.ctaLink && post.value.ctaText ? /* @__PURE__ */ _jsxQ("div", null, {
        class: "mt-16 bg-surface-container-lowest border border-primary/20 rounded-3xl p-8 md:p-12 text-center shadow-lg shadow-primary/5"
      }, [
        /* @__PURE__ */ _jsxQ("h2", null, {
          class: "font-headline text-2xl md:text-3xl font-bold text-on-surface mb-4"
        }, "Take the next step", 3, null),
        /* @__PURE__ */ _jsxQ("p", null, {
          class: "text-on-surface-variant mb-8 max-w-xl mx-auto"
        }, "Experience the transformative power firsthand—whether you seek divine support or sacred protection for your path.", 3, null),
        post.value.ctaLink.startsWith("http") ? /* @__PURE__ */ _jsxQ("a", null, {
          href: _fnSignal((p0) => p0.value.ctaLink, [
            post
          ], "p0.value.ctaLink"),
          target: "_blank",
          rel: "noopener noreferrer",
          class: "inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform"
        }, [
          _fnSignal((p0) => p0.value.ctaText, [
            post
          ], "p0.value.ctaText"),
          /* @__PURE__ */ _jsxQ("span", null, {
            class: "material-symbols-outlined text-lg"
          }, "open_in_new", 3, null)
        ], 3, "FA_5") : /* @__PURE__ */ _jsxC(Link, {
          get href() {
            return post.value.ctaLink;
          },
          class: "inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform",
          children: [
            _fnSignal((p0) => p0.value.ctaText, [
              post
            ], "p0.value.ctaText"),
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "material-symbols-outlined text-lg"
            }, "arrow_forward", 3, null)
          ],
          [_IMMUTABLE]: {
            href: _fnSignal((p0) => p0.value.ctaLink, [
              post
            ], "p0.value.ctaLink"),
            class: _IMMUTABLE
          }
        }, 3, "FA_6")
      ], 1, "FA_7") : null,
      post.value.prev || post.value.next ? /* @__PURE__ */ _jsxQ("nav", null, {
        class: "mt-16 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-outline-variant/30 pt-8"
      }, [
        post.value.prev ? /* @__PURE__ */ _jsxC(Link, {
          get href() {
            return `/blog/${post.value.prev.slug}`;
          },
          class: "group flex flex-col gap-1 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest hover:bg-primary/5 transition-colors p-5 no-underline",
          children: [
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "flex items-center text-primary text-xs font-bold uppercase tracking-widest"
            }, [
              /* @__PURE__ */ _jsxQ("span", null, {
                class: "material-symbols-outlined text-base mr-1"
              }, "arrow_back", 3, null),
              "Previous"
            ], 3, null),
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "font-headline font-bold text-on-surface text-lg leading-snug group-hover:text-primary"
            }, _fnSignal((p0) => p0.value.prev.title, [
              post
            ], "p0.value.prev.title"), 3, null)
          ],
          [_IMMUTABLE]: {
            href: _fnSignal((p0) => `/blog/${p0.value.prev.slug}`, [
              post
            ], "`/blog/${p0.value.prev.slug}`"),
            class: _IMMUTABLE
          }
        }, 3, "FA_8") : /* @__PURE__ */ _jsxQ("div", null, {
          class: "hidden md:block"
        }, null, 3, null),
        post.value.next ? /* @__PURE__ */ _jsxC(Link, {
          get href() {
            return `/blog/${post.value.next.slug}`;
          },
          class: "group flex flex-col gap-1 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest hover:bg-primary/5 transition-colors p-5 md:text-right no-underline",
          children: [
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "flex items-center md:justify-end text-primary text-xs font-bold uppercase tracking-widest"
            }, [
              "Next",
              /* @__PURE__ */ _jsxQ("span", null, {
                class: "material-symbols-outlined text-base ml-1"
              }, "arrow_forward", 3, null)
            ], 3, null),
            /* @__PURE__ */ _jsxQ("span", null, {
              class: "font-headline font-bold text-on-surface text-lg leading-snug group-hover:text-primary"
            }, _fnSignal((p0) => p0.value.next.title, [
              post
            ], "p0.value.next.title"), 3, null)
          ],
          [_IMMUTABLE]: {
            href: _fnSignal((p0) => `/blog/${p0.value.next.slug}`, [
              post
            ], "`/blog/${p0.value.next.slug}`"),
            class: _IMMUTABLE
          }
        }, 3, "FA_9") : null
      ], 1, "FA_10") : null
    ], 1, null)
  ], 1, "FA_11");
};
const index = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_lq8DmIU6K08, "s_lq8DmIU6K08"));
const head = ({ resolveValue }) => {
  var _a;
  const p = resolveValue(usePost);
  const title = `${p.seo_title || p.title} | DevUtsav`;
  const desc = p.seo_description || p.excerpt || "";
  const img = p.og_image || p.image || "";
  const keywords = (_a = p.seo_keywords) == null ? void 0 : _a.trim();
  return {
    title,
    meta: [
      {
        name: "description",
        content: desc
      },
      ...keywords ? [
        {
          name: "keywords",
          content: keywords
        }
      ] : [],
      {
        property: "og:title",
        content: title
      },
      {
        property: "og:description",
        content: desc
      },
      {
        property: "og:type",
        content: "article"
      },
      ...img ? [
        {
          property: "og:image",
          content: img
        }
      ] : []
    ]
  };
};
const BlogSlugRoute = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index,
  head,
  onStaticGenerate,
  usePost
}, Symbol.toStringTag, { value: "Module" }));
const serverPlugins = [];
const AdminLayout = () => AdminLayout_;
const Layout = () => Layout_;
const routes = [
  ["/", [Layout, () => IndexRoute], "/", ["q-BrHEKD1m.js", "q-DQVWUk3-.js"]],
  ["sitemap.xml", [Layout, () => SitemapRoute], "/sitemap.xml", ["q-BrHEKD1m.js", "q-Jxi-xeSd.js"]],
  ["admin/blogs/bulk/", [Layout, AdminLayout, () => AdminBlogsBulkRoute], "/admin/blogs/bulk/", ["q-BrHEKD1m.js", "q-CjI7SFOG.js", "q-BD_5lken.js"]],
  ["admin/blogs/new/", [Layout, AdminLayout, () => AdminBlogsNewRoute], "/admin/blogs/new/", ["q-BrHEKD1m.js", "q-CjI7SFOG.js", "q-MYgIA4XZ.js"]],
  ["admin/blogs/", [Layout, AdminLayout, () => AdminBlogsRoute], "/admin/blogs/", ["q-BrHEKD1m.js", "q-CjI7SFOG.js", "q-D-JrnVPV.js"]],
  ["admin/events/", [Layout, AdminLayout, () => AdminEventsRoute], "/admin/events/", ["q-BrHEKD1m.js", "q-CjI7SFOG.js", "q-BlVAJ9G6.js"]],
  ["admin/images/", [Layout, AdminLayout, () => AdminImagesRoute], "/admin/images/", ["q-BrHEKD1m.js", "q-CjI7SFOG.js", "q-BwGye0DW.js"]],
  ["admin/pages/", [Layout, AdminLayout, () => AdminPagesRoute], "/admin/pages/", ["q-BrHEKD1m.js", "q-CjI7SFOG.js", "q-k8vr8zU4.js"]],
  ["admin/scheduler/", [Layout, AdminLayout, () => AdminSchedulerRoute], "/admin/scheduler/", ["q-BrHEKD1m.js", "q-CjI7SFOG.js", "q-DrNCyioX.js"]],
  ["admin/users/", [Layout, AdminLayout, () => AdminUsersRoute], "/admin/users/", ["q-BrHEKD1m.js", "q-CjI7SFOG.js", "q-Kt2LuK8f.js"]],
  ["blog/articles/", [Layout, () => BlogArticlesRoute], "/blog/articles/", ["q-BrHEKD1m.js", "q-D6R6Qy3K.js"]],
  ["blog/categories/", [Layout, () => BlogCategoriesRoute], "/blog/categories/", ["q-BrHEKD1m.js", "q-ChsRcpeN.js"]],
  ["admin/", [Layout, AdminLayout, () => AdminRoute], "/admin/", ["q-BrHEKD1m.js", "q-CjI7SFOG.js", "q-CmBvxir1.js"]],
  ["analyzer/", [Layout, () => AnalyzerRoute], "/analyzer/", ["q-BrHEKD1m.js", "q-CdcXO52j.js"]],
  ["blog/", [Layout, () => BlogRoute], "/blog/", ["q-BrHEKD1m.js", "q-DcKptMJp.js"]],
  ["chadhawa/", [Layout, () => ChadhawaRoute], "/chadhawa/", ["q-BrHEKD1m.js", "q-C1Ahk100.js"]],
  ["horoscope/", [Layout, () => HoroscopeRoute], "/horoscope/", ["q-BrHEKD1m.js", "q-Cr-77EDJ.js"]],
  ["kundali/", [Layout, () => KundaliRoute], "/kundali/", ["q-BrHEKD1m.js", "q-CAEBqURl.js"]],
  ["puja/", [Layout, () => PujaRoute], "/puja/", ["q-BrHEKD1m.js", "q-DicI-1X-.js"]],
  ["ritual-guide/", [Layout, () => RitualguideRoute], "/ritual-guide/", ["q-BrHEKD1m.js", "q-BwFyJBPW.js"]],
  ["whisper/", [Layout, () => WhisperRoute], "/whisper/", ["q-BrHEKD1m.js", "q-CwT81eMn.js"]],
  ["blog/[slug]/", [Layout, () => BlogSlugRoute], "/blog/[slug]/", ["q-BrHEKD1m.js", "q-BOSSlYuS.js"]]
];
const menus = [];
const trailingSlash = true;
const basePathname = "/";
const cacheModules = true;
const _qwikCityPlan = { routes, serverPlugins, menus, trailingSlash, basePathname, cacheModules };
export {
  basePathname,
  cacheModules,
  _qwikCityPlan as default,
  menus,
  routes,
  serverPlugins,
  trailingSlash
};
