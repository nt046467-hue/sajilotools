export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface ToolContent {
  slug: string;
  aboutParagraphs: string[];
  faqs: ToolFAQ[];
  howToSteps?: string[];
}

export const TOOL_CONTENT_MAP: Record<string, ToolContent> = {
  // ── Developer Tools ──────────────────────────────────────────────────────
  "json-formatter": {
    slug: "json-formatter",
    aboutParagraphs: [
      "JSON Formatter & Validator is an essential browser utility for software engineers, API developers, and data analysts who work with JSON data structures. It automatically parses raw, unformatted, or minified JSON strings and formats them into a clean, human-readable hierarchy with syntax highlighting.",
      "Beyond basic indentation and prettifying, this tool performs real-time JSON validation to pinpoint syntax errors such as trailing commas, unescaped strings, or missing quotes. All processing happens 100% locally on your machine, ensuring API keys, payloads, and sensitive customer data never leave your browser."
    ],
    faqs: [
      {
        question: "Does this JSON Formatter support large payloads?",
        answer: "Yes, it efficiently parses and formats large JSON payloads up to several megabytes directly in memory using your browser's optimized JavaScript engine."
      },
      {
        question: "Can I convert or copy formatted JSON easily?",
        answer: "Absolutely. You can copy the formatted output with a single click or download it directly as a formatted .json file."
      },
      {
        question: "Will my confidential JSON data be uploaded to any server?",
        answer: "No. SajiloTools processes all JSON data entirely in your local browser session using client-side JavaScript. No network requests are made."
      },
      {
        question: "Does this tool detect syntax errors in JSON?",
        answer: "Yes, if your JSON string has invalid syntax (such as missing brackets or unescaped quotes), the built-in parser highlights the exact line and error details."
      }
    ],
    howToSteps: [
      "Paste your raw JSON code or upload a .json file.",
      "Click 'Format JSON' to clean, indent, and highlight syntax.",
      "Use 'Copy' or 'Download' to export your formatted JSON."
    ]
  },

  "base64-encoder": {
    slug: "base64-encoder",
    aboutParagraphs: [
      "Base64 Encoder & Decoder provides instant, secure binary-to-text encoding for web developers, system administrators, and security specialists. Base64 encoding is widely used for embedding inline images in CSS, sending binary payloads over HTTP headers, and encoding email attachments.",
      "Our tool handles standard UTF-8 string encoding as well as binary file conversion with full round-trip accuracy. Because operations execute locally in your client session, your tokens and private files remain private."
    ],
    faqs: [
      {
        question: "What is Base64 encoding used for?",
        answer: "Base64 encoding converts binary data into ASCII text characters, making it safe to transmit data inside URLs, JSON payloads, and HTTP headers without corruption."
      },
      {
        question: "Is Base64 encoding considered encryption?",
        answer: "No, Base64 is an encoding scheme, not encryption. It can be decoded easily by anyone, so do not use Base64 alone to protect sensitive passwords."
      },
      {
        question: "Does this tool support UTF-8 characters and emojis?",
        answer: "Yes, our encoder handles standard Unicode characters, non-Latin scripts (including Devanagari), and emojis smoothly."
      },
      {
        question: "Can I decode Base64 strings back to plain text?",
        answer: "Yes, toggle to Decode mode to instantly convert any valid Base64 string back into readable text or raw file data."
      }
    ]
  },

  "url-encoder": {
    slug: "url-encoder",
    aboutParagraphs: [
      "URL Encoder & Decoder (Percent-Encoder) safeguards web URLs by encoding special characters into RFC 3986 compliant percent-encoded strings. Reserved characters like spaces, ampersands, question marks, and non-ASCII symbols are converted into safe hexadecimal representation.",
      "Essential for web developers building query strings, deep links, and API request parameters, this tool ensures web browsers and web servers parse your link parameters without broken paths or unexpected errors."
    ],
    faqs: [
      {
        question: "Why do URLs need percent-encoding?",
        answer: "URLs can only contain a limited set of ASCII characters. Characters like spaces, ?, &, and non-English scripts must be encoded so web servers understand where parameters begin and end."
      },
      {
        question: "What is the difference between encodeURI and encodeURIComponent?",
        answer: "encodeURI preserves URL structure (like http:// and slashes), while encodeURIComponent encodes every special character, making it ideal for query parameter values."
      },
      {
        question: "Can I decode percent-encoded URLs?",
        answer: "Yes, switch to URL Decode mode to convert %20 back to spaces and %26 back to ampersands."
      },
      {
        question: "Does this tool conform to RFC 3986 standards?",
        answer: "Yes, it implements standard RFC 3986 percent-encoding for full compatibility across modern browsers and backend servers."
      }
    ]
  },

  "hash-generator": {
    slug: "hash-generator",
    aboutParagraphs: [
      "Hash Generator calculates cryptographic checksums (MD5, SHA-1, SHA-256, SHA-512) for text strings and files in real-time. Hashes are one-way cryptographic algorithms used to verify file integrity, generate unique identifiers, and check data tampering.",
      "Whether you are verifying a downloaded software checksum or testing database digest values, all hashing algorithms run locally using standard cryptographic JavaScript libraries."
    ],
    faqs: [
      {
        question: "Which hash algorithm should I use for security?",
        answer: "For security and digital signatures, use SHA-256 or SHA-512. MD5 and SHA-1 are legacy algorithms suited primarily for fast non-critical checksum checks."
      },
      {
        question: "Can a cryptographic hash be reversed?",
        answer: "No, cryptographic hash functions are one-way math functions. You cannot reconstruct the original text from the hash output."
      },
      {
        question: "Are my input strings hashed on a server?",
        answer: "No, all hash calculations are processed locally inside your browser engine."
      },
      {
        question: "Can I generate hashes for files as well as text?",
        answer: "Yes, upload any file to generate its MD5 or SHA-256 checksum without uploading the file content online."
      }
    ]
  },

  "regex-tester": {
    slug: "regex-tester",
    aboutParagraphs: [
      "Regex Tester & Debugger allows developers to write, test, and refine regular expression patterns against sample text in real time. It features match highlighting, group capturing, and regex flag controls (global, case-insensitive, multiline).",
      "Perfect for validating email formats, phone numbers, log patterns, and data extraction rules without needing to restart code compilers."
    ],
    faqs: [
      {
        question: "Which Regex engine does this tool use?",
        answer: "It uses JavaScript's native ECMAScript RegExp engine, matching exact browser runtime regex behavior."
      },
      {
        question: "Does it support regex flags like 'g' and 'i'?",
        answer: "Yes, you can toggle Global (g), Case-Insensitive (i), Multiline (m), and Unicode (u) flags directly in the control panel."
      },
      {
        question: "Does it display regex capture groups?",
        answer: "Yes, matched groups and parenthesized sub-matches are listed with indexes for debugging."
      },
      {
        question: "Is there a limit on sample text length?",
        answer: "You can test thousands of lines of log data directly in your browser without performance degradation."
      }
    ]
  },

  "color-picker": {
    slug: "color-picker",
    aboutParagraphs: [
      "Color Picker & Palette Generator is a modern utility for UI designers and front-end developers to pick, convert, and harmonize color codes. Easily translate between HEX, RGB, HSL, and HSV color representations.",
      "Copy precise CSS color values, inspect contrast ratios, and build harmonious color schemes for web applications and digital graphics."
    ],
    faqs: [
      {
        question: "Can I convert HEX colors to RGB or HSL?",
        answer: "Yes, selecting or typing any color code automatically converts it into HEX, RGB, and HSL formats simultaneously."
      },
      {
        question: "Is there a one-click copy button for CSS code?",
        answer: "Yes, click any formatted color value to copy it directly to your clipboard."
      },
      {
        question: "Does it calculate contrast ratio for accessibility?",
        answer: "Yes, it displays WCAG accessibility contrast ratios for white and black text over the chosen background color."
      },
      {
        question: "Can I generate complementary color palettes?",
        answer: "Yes, it generates complementary, analogous, and triadic color scheme suggestions automatically."
      }
    ]
  },

  "password-generator": {
    slug: "password-generator",
    aboutParagraphs: [
      "Password Generator creates cryptographically secure, random passwords to protect online accounts against brute-force attacks and credential stuffing.",
      "Customize password length, include uppercase/lowercase letters, digits, and special symbols, or generate easy-to-remember passphrase combinations."
    ],
    faqs: [
      {
        question: "How secure are the generated passwords?",
        answer: "Passwords are generated using browser-level cryptographically secure random number generators (`crypto.getRandomValues`), ensuring high entropy."
      },
      {
        question: "Are generated passwords saved or sent to a server?",
        answer: "No, passwords are created locally in your browser memory and are never saved, logged, or transmitted anywhere."
      },
      {
        question: "What length is recommended for strong passwords?",
        answer: "We recommend at least 14 to 16 characters containing a mix of letters, numbers, and special symbols."
      },
      {
        question: "Can I generate pronounceable passphrases?",
        answer: "Yes, toggle the Passphrase option to generate memorable multi-word passphrases."
      }
    ]
  },

  "lorem-ipsum": {
    slug: "lorem-ipsum",
    aboutParagraphs: [
      "Lorem Ipsum Generator produces customizable placeholder text for web designers, graphic artists, and layout typography testing.",
      "Generate paragraphs, sentences, words, or HTML-wrapped list items with traditional Latin or fun localized dummy text options."
    ],
    faqs: [
      {
        question: "Can I generate HTML markup like <p> and <li> tags?",
        answer: "Yes, toggle the HTML format option to output pre-wrapped paragraphs and list tags for fast copy-pasting into code."
      },
      {
        question: "Why is Lorem Ipsum used in web design?",
        answer: "Dummy text allows reviewers to focus on visual layout, typography, and spacing without being distracted by readable content."
      },
      {
        question: "Can I specify exact word or sentence counts?",
        answer: "Yes, customize the exact number of paragraphs, sentences, or words needed for your design container."
      },
      {
        question: "Is there a localized Nepali filler text mode?",
        answer: "Yes, you can switch between classic Latin Lorem Ipsum and Nepali-themed placeholder words."
      }
    ]
  },

  "qr-generator": {
    slug: "qr-generator",
    aboutParagraphs: [
      "QR Code Generator creates customizable Quick Response (QR) codes for website URLs, WiFi credentials, plain text, email addresses, and phone numbers.",
      "Customize foreground and background colors, dot styles, and download high-resolution PNG or vector SVG files ready for print and digital media."
    ],
    faqs: [
      {
        question: "Do generated QR codes ever expire?",
        answer: "No, static QR codes encode data directly into the pattern and will work forever without subscription fees."
      },
      {
        question: "Can I download vector SVG files for printing?",
        answer: "Yes, you can export QR codes as crisp vector SVG files or high-definition PNG images."
      },
      {
        question: "Can I create a WiFi QR code for instant connecting?",
        answer: "Yes, choose the WiFi preset to encode your network name (SSID) and password so phones can scan to join."
      },
      {
        question: "Are there any scan limits on generated QR codes?",
        answer: "No, your generated QR codes have unlimited scans and can be used commercially."
      }
    ]
  },

  "timezone-converter": {
    slug: "timezone-converter",
    aboutParagraphs: [
      "Time Zone Converter helps international teams, remote workers, and travelers compare local time across multiple world timezones simultaneously.",
      "Features explicit support for Nepal Standard Time (NST / UTC+5:45) alongside UTC, EST, PST, GMT, IST, and major global business centers."
    ],
    faqs: [
      {
        question: "Does it support Nepal Standard Time (UTC+5:45)?",
        answer: "Yes, Nepal's unique 45-minute offset (UTC+5:45) is fully supported alongside all standard global time zones."
      },
      {
        question: "Does it adjust automatically for Daylight Saving Time (DST)?",
        answer: "Yes, DST changes for countries in North America, Europe, and Australia are computed accurately based on the selected date."
      },
      {
        question: "Can I compare multiple cities at once?",
        answer: "Yes, add multiple target cities to view side-by-side time alignments across interactive slider hours."
      },
      {
        question: "Can I share a converted meeting time link?",
        answer: "Yes, copy the generated URL to share precise meeting time alignments with remote team members."
      }
    ]
  },

  "markdown-preview": {
    slug: "markdown-preview",
    aboutParagraphs: [
      "Markdown Previewer is a live, split-screen editor that compiles GitHub Flavored Markdown (GFM) into clean HTML in real time.",
      "Write documentation, README files, blog posts, and notes with instant rendering for headings, lists, code blocks, tables, and task checkboxes."
    ],
    faqs: [
      {
        question: "Does it support GitHub Flavored Markdown (GFM)?",
        answer: "Yes, it supports tables, task lists, code block syntax highlighting, and strikethrough markup."
      },
      {
        question: "Can I export the rendered HTML?",
        answer: "Yes, copy raw compiled HTML or download formatted markdown files with a single click."
      },
      {
        question: "Can I upload existing .md files for editing?",
        answer: "Yes, drag and drop any .md file into the editor to preview and edit its contents instantly."
      },
      {
        question: "Are my notes saved on a server?",
        answer: "No, your content stays in local browser storage so your draft articles and code docs stay private."
      }
    ]
  },

  "link-shortener": {
    slug: "link-shortener",
    aboutParagraphs: [
      "Link Shortener transforms long, cumbersome URLs into short, memorable links with custom slug aliases.",
      "Track click statistics, generate matching QR codes, and simplify link sharing for social media posts, SMS, and messaging apps."
    ],
    faqs: [
      {
        question: "Can I customize the short link alias?",
        answer: "Yes, you can specify custom slug aliases for branding or let the system generate a short random key."
      },
      {
        question: "Do shortened links include click analytics?",
        answer: "Yes, view total click counts and creation timestamps for your links."
      },
      {
        question: "Can I generate a QR code for shortened links?",
        answer: "Yes, every shortened link provides an instant companion QR code for mobile scanning."
      },
      {
        question: "Are shortened links permanent?",
        answer: "Yes, shortened links remain active indefinitely without recurring payment requirements."
      }
    ]
  },

  "uuid-generator": {
    slug: "uuid-generator",
    aboutParagraphs: [
      "UUID / GUID Generator generates RFC 4122 compliant version 4 Universally Unique Identifiers. Generate single or bulk UUIDs with customized uppercase/lowercase formatting and hyphen options.",
      "Ideal for database primary keys, distributed system trace IDs, API session tokens, and mock test data creation."
    ],
    faqs: [
      {
        question: "What is a Version 4 UUID?",
        answer: "A Version 4 UUID is a 128-bit randomly generated identifier with a virtually zero chance of collision across systems."
      },
      {
        question: "Can I generate multiple UUIDs at once?",
        answer: "Yes, you can generate up to 500 UUIDs in a single click and download them as text or CSV."
      },
      {
        question: "Can I remove hyphens or switch to uppercase letters?",
        answer: "Yes, toggle custom formatting settings to output uppercase letters or remove hyphens."
      },
      {
        question: "Is this UUID generator suitable for database primary keys?",
        answer: "Yes, RFC 4122 v4 UUIDs are universally standard for PostgreSQL, MongoDB, MySQL, and API token identifiers."
      }
    ]
  },

  "jwt-decoder": {
    slug: "jwt-decoder",
    aboutParagraphs: [
      "JWT Decoder allows web developers to decode JSON Web Token (JWT) headers, claims, and payload data without sending security tokens over the internet.",
      "Inspect token expiration times (exp), issuer details (iss), user roles, and claim structures safely within your local browser sandbox."
    ],
    faqs: [
      {
        question: "Is it safe to paste JWT tokens into this tool?",
        answer: "Yes. SajiloTools decodes JWTs entirely on your local browser instance. Your secret keys and authorization tokens are never sent to external servers."
      },
      {
        question: "Does decoding a JWT verify its signature?",
        answer: "Decoding displays the token's header and payload. Optional HMAC signature verification can be tested if you supply your secret key locally."
      },
      {
        question: "Does it convert epoch expiration timestamps to human dates?",
        answer: "Yes, claims like `exp`, `iat`, and `nbf` are automatically converted into human-readable local dates and expiration status indicators."
      },
      {
        question: "What types of JWT algorithms are recognized?",
        answer: "The decoder parses standard JWT headers specifying HS256, RS256, ES256, and generic JOSE headers."
      }
    ]
  },

  "unix-timestamp-converter": {
    slug: "unix-timestamp-converter",
    aboutParagraphs: [
      "Unix Timestamp Converter parses Unix epoch timestamps (seconds or milliseconds since Jan 01 1970 UTC) into human-readable date and time formats across local, UTC, and Nepal (NST) timezones.",
      "Convert human dates back into Unix epoch integer values for database queries, API testing, and log debugging."
    ],
    faqs: [
      {
        question: "What is a Unix Timestamp?",
        answer: "A Unix timestamp is the total number of seconds that have elapsed since 00:00:00 UTC on January 1, 1970."
      },
      {
        question: "Does this tool support Nepal Standard Time (NST)?",
        answer: "Yes, timestamps are converted into UTC, local browser time, and Nepal Standard Time (UTC+5:45)."
      },
      {
        question: "Does it detect millisecond epoch timestamps?",
        answer: "Yes, 13-digit millisecond timestamps (JavaScript `Date.now()`) and 10-digit second timestamps are recognized automatically."
      },
      {
        question: "Can I convert a human date string back to epoch seconds?",
        answer: "Yes, select any date and time on the calendar picker to generate its exact Unix epoch integer."
      }
    ]
  },

  "css-js-minifier": {
    slug: "css-js-minifier",
    aboutParagraphs: [
      "CSS & JavaScript Minifier reduces web file sizes by stripping unnecessary whitespace, line breaks, indentation, and comments from production code assets.",
      "Minified code loads faster over web networks, reducing page load times and bandwidth consumption without modifying code execution behavior."
    ],
    faqs: [
      {
        question: "Does minifying break CSS or JavaScript logic?",
        answer: "No, minification safely removes superfluous whitespace and comments while preserving all functional syntax and selectors."
      },
      {
        question: "What percentage of file size reduction can I expect?",
        answer: "Typical code assets experience 20% to 50% file size reduction depending on existing code formatting."
      },
      {
        question: "Are my code files stored on your server?",
        answer: "No, all minification scripts execute in client-side JavaScript inside your browser."
      },
      {
        question: "Can I copy or download minified files directly?",
        answer: "Yes, click 'Copy Minified Code' or download as `.min.css` / `.min.js` files."
      }
    ]
  },

  // ── Text Tools ──────────────────────────────────────────────────────────
  "word-counter": {
    slug: "word-counter",
    aboutParagraphs: [
      "Word & Character Counter provides comprehensive text analysis for content writers, students, SEO specialists, and copywriters. Get instant metrics on word count, character count (with and without spaces), sentence count, paragraph count, and estimated reading time.",
      "Designed for privacy and speed, the analyzer updates live as you type or paste text. Works seamlessly with English, Nepali Devanagari, and multilingual content."
    ],
    faqs: [
      {
        question: "Does this word counter support Nepali Devanagari text?",
        answer: "Yes, it correctly identifies words, characters, and sentences written in Nepali Devanagari script."
      },
      {
        question: "How is estimated reading time calculated?",
        answer: "Reading time is calculated based on an average adult reading speed of 200 words per minute."
      },
      {
        question: "Does it count character totals with and without spaces?",
        answer: "Yes, both total characters including spaces and net characters excluding spaces are displayed side-by-side."
      },
      {
        question: "Is there a limit on how long the text can be?",
        answer: "No, you can paste large essays, manuscripts, or transcripts with thousands of words without lag."
      }
    ]
  },

  "case-converter": {
    slug: "case-converter",
    aboutParagraphs: [
      "Case Converter transforms text strings instantly into UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case.",
      "Streamline code variable naming, clean up messy article headlines, and format social media posts with one-click conversion buttons."
    ],
    faqs: [
      {
        question: "What is the difference between camelCase and snake_case?",
        answer: "camelCase capitalizes each word except the first without spaces (e.g. myVariableName), while snake_case uses lowercase words separated by underscores (e.g. my_variable_name)."
      },
      {
        question: "How does Title Case conversion work?",
        answer: "Title Case capitalizes the first letter of every principal word while leaving minor prepositions formatted appropriately."
      },
      {
        question: "Can I convert text back into lowercase or UPPERCASE?",
        answer: "Yes, click the UPPERCASE or lowercase button to transform all characters immediately."
      },
      {
        question: "Is my text data saved on any server?",
        answer: "No, all string transformations happen locally in your web browser memory."
      }
    ]
  },

  "text-diff": {
    slug: "text-diff",
    aboutParagraphs: [
      "Text Diff Checker compares two text documents or code snippets side-by-side and highlights added, deleted, or modified lines.",
      "Essential for developers, editors, and legal document reviews to inspect code revisions and text differences quickly."
    ],
    faqs: [
      {
        question: "How does the side-by-side comparison work?",
        answer: "Red highlights indicate deleted text from the original document, while green highlights show additions in the updated text."
      },
      {
        question: "Can I compare code snippets as well as plain prose?",
        answer: "Yes, it handles programming source code, JSON data, HTML markup, and plain text documents."
      },
      {
        question: "Is there an inline diff mode available?",
        answer: "Yes, you can toggle between side-by-side split view and single unified inline diff view."
      },
      {
        question: "Are my compared files uploaded to remote servers?",
        answer: "No, document comparison algorithms run 100% locally inside your browser."
      }
    ]
  },

  "string-utilities": {
    slug: "string-utilities",
    aboutParagraphs: [
      "String Utilities provides a versatile toolkit for text manipulation: slugify strings for URLs, reverse text, trim whitespace, remove duplicate lines, count character frequencies, and escape HTML.",
      "A Swiss army knife for writers, web developers, and data scrubbers needing quick text cleaning without writing custom scripts."
    ],
    faqs: [
      {
        question: "What does the Slugify tool do?",
        answer: "Slugify converts titles into clean, URL-friendly slugs by lowercasing text, replacing spaces with hyphens, and removing special characters."
      },
      {
        question: "Can I remove duplicate lines from a text file?",
        answer: "Yes, paste your list and click 'Remove Duplicate Lines' to deduplicate items instantly."
      },
      {
        question: "How does HTML escaping work?",
        answer: "It converts characters like `<`, `>`, `&`, and `\"` into safe HTML entities (`&lt;`, `&gt;`, `&amp;`) to prevent XSS vulnerabilities."
      },
      {
        question: "Is there a limit on input length?",
        answer: "No, you can process thousands of lines of text directly in your browser."
      }
    ]
  },

  // ── PDF Tools ───────────────────────────────────────────────────────────
  "pdf-merger": {
    slug: "pdf-merger",
    aboutParagraphs: [
      "PDF Merger allows you to combine multiple PDF documents, reports, and scanned receipts into a single organized PDF file. Drag and drop files, reorder pages, and merge in seconds.",
      "Your documents are processed locally in your browser using Client-Side PDF libraries — ensuring government documents, academic files, and private bank statements remain 100% confidential."
    ],
    faqs: [
      {
        question: "Is there a limit on how many PDFs I can merge?",
        answer: "There is no fixed limit. You can merge as many PDF files as your device memory supports."
      },
      {
        question: "Are my PDF files uploaded to a remote server?",
        answer: "No. All PDF merging operations take place entirely inside your web browser. No files are uploaded."
      },
      {
        question: "Can I reorder PDF files before merging?",
        answer: "Yes, drag and drop file cards to arrange the exact sequence before combining them."
      },
      {
        question: "Does merging reduce document print quality?",
        answer: "No, vector fonts, embedded images, and layout resolution are preserved with 100% fidelity."
      }
    ]
  },

  "pdf-splitter": {
    slug: "pdf-splitter",
    aboutParagraphs: [
      "PDF Splitter enables you to extract specific page ranges or split a multi-page PDF into separate standalone document files.",
      "Select custom page ranges (e.g., pages 1-3, 5, 8-10) and save extracted pages immediately without watermarks or quality loss."
    ],
    faqs: [
      {
        question: "Can I extract specific page ranges from a PDF?",
        answer: "Yes, enter individual page numbers or page ranges to extract exactly what you need."
      },
      {
        question: "Can I split every page into a separate PDF file?",
        answer: "Yes, choose 'Split All Pages' to export each page as an individual downloadable PDF."
      },
      {
        question: "Is my original PDF document altered?",
        answer: "No, your original file remains untouched on your device; new split PDFs are generated independently."
      },
      {
        question: "Are password-protected PDFs supported?",
        answer: "If you enter the owner password, unlocked pages can be extracted and saved securely."
      }
    ]
  },

  "pdf-to-word": {
    slug: "pdf-to-word",
    aboutParagraphs: [
      "PDF to Word Converter extracts document text, headings, and paragraph formatting from PDF files into editable Microsoft Word (.docx) documents.",
      "Avoid retyping scanned notes or report documents by converting PDFs into clean, editable Word files directly in your web browser."
    ],
    faqs: [
      {
        question: "Will the converted Word document be fully editable?",
        answer: "Yes, text content, paragraphs, and structure are exported into a standard editable `.docx` file."
      },
      {
        question: "Are scanned image PDFs supported for Word conversion?",
        answer: "Vector text PDFs convert directly. For scanned image PDFs, text is extracted via integrated browser OCR processing."
      },
      {
        question: "Are my uploaded PDF files kept private?",
        answer: "Yes, processing happens locally in your browser memory without uploading sensitive files to external cloud servers."
      },
      {
        question: "Do I need Microsoft Word installed to perform conversion?",
        answer: "No software is required. The converted `.docx` file can be opened in Word, Google Docs, or LibreOffice."
      }
    ]
  },

  "pdf-organizer": {
    slug: "pdf-organizer",
    aboutParagraphs: [
      "PDF Organizer allows you to rotate upside-down pages, delete unwanted pages, and reorder document pages using intuitive visual thumbnail drag-and-drop.",
      "Clean up scanned government forms, remove blank pages, and fix page orientations before printing or emailing documents."
    ],
    faqs: [
      {
        question: "Can I rotate individual pages in a PDF?",
        answer: "Yes, rotate individual pages 90°, 180°, or 270° clockwise or counter-clockwise."
      },
      {
        question: "How do I delete unwanted pages from a PDF?",
        answer: "Hover over any page thumbnail and click the delete icon to remove it from the final document."
      },
      {
        question: "Can I reorder pages by dragging thumbnails?",
        answer: "Yes, simply drag and drop page thumbnails into your desired sequential order."
      },
      {
        question: "Is there any watermark added to organized PDFs?",
        answer: "No, SajiloTools never adds watermarks or branding to your processed PDF files."
      }
    ]
  },

  "pdf-watermark": {
    slug: "pdf-watermark",
    aboutParagraphs: [
      "PDF Watermark adds custom text or logo image watermarks across every page of your PDF documents to protect intellectual property and prevent unauthorized distribution.",
      "Adjust watermark opacity, rotation angle, font size, and positioning with live visual preview."
    ],
    faqs: [
      {
        question: "Can I add both text and image watermarks?",
        answer: "Yes, you can apply custom text stamps or upload image logos as watermarks."
      },
      {
        question: "Can I customize watermark opacity and angle?",
        answer: "Yes, adjust transparency sliders, font size, and diagonal rotation angles with live visual preview."
      },
      {
        question: "Does watermarking affect underlying text readability?",
        answer: "By setting opacity to 15-30%, your watermark remains clearly visible without obscuring underlying document text."
      },
      {
        question: "Can I watermark specific pages instead of the whole file?",
        answer: "Yes, select whether to apply the watermark across all pages or custom page ranges."
      }
    ]
  },

  "jpg-pdf-converter": {
    slug: "jpg-pdf-converter",
    aboutParagraphs: [
      "JPG to PDF Converter converts photos, scanned documents, and images (JPG, PNG, WebP) into a single clean PDF document. Alternatively, convert PDF pages into high-resolution JPG images.",
      "Perfect for submitting scanned citizenship cards, passport copies, transcripts, and official application forms in Nepal."
    ],
    faqs: [
      {
        question: "Can I convert multiple images into one PDF?",
        answer: "Yes, upload multiple JPG or PNG images, reorder them, and combine them into a single multi-page PDF."
      },
      {
        question: "Can I extract PDF pages as JPG images?",
        answer: "Yes, switch to 'PDF to JPG' mode to save individual PDF pages as crisp image files."
      },
      {
        question: "Does it support custom page orientations and margins?",
        answer: "Yes, choose A4, Letter, or Auto page sizes with adjustable margin padding."
      },
      {
        question: "Are citizenship scans secure during conversion?",
        answer: "100% secure. Conversion runs locally in your browser memory so private IDs are never uploaded."
      }
    ]
  },

  "pdf-compressor": {
    slug: "pdf-compressor",
    aboutParagraphs: [
      "PDF Compressor reduces large PDF file sizes by recompressing embedded images and removing redundant metadata objects.",
      "Shrink PDFs to meet strict file attachment size limits (e.g. under 2MB) for government job portals, university applications, and email attachments."
    ],
    faqs: [
      {
        question: "How much can PDF file size be reduced?",
        answer: "File size reduction ranges from 30% to 80% depending on the resolution and quantity of embedded images."
      },
      {
        question: "Does PDF compression reduce text clarity?",
        answer: "Vector text and fonts remain 100% sharp; only embedded bitmap images are re-sampled for size efficiency."
      },
      {
        question: "Is there a file size upload limit?",
        answer: "Because compression happens locally in browser memory, you can compress large files up to several hundred megabytes."
      },
      {
        question: "Are compressed PDFs compatible with standard PDF readers?",
        answer: "Yes, compressed files adhere to standard PDF specs and open smoothly in Adobe Reader, web browsers, and mobile devices."
      }
    ]
  },

  // ── Image Tools ─────────────────────────────────────────────────────────
  "image-compressor": {
    slug: "image-compressor",
    aboutParagraphs: [
      "Image Compressor optimizes and shrinks JPG, PNG, and WebP image file sizes by up to 80% without noticeable visual quality loss.",
      "Faster image loading improves website performance, reduces bandwidth consumption, and meets file size limits for online job applications."
    ],
    faqs: [
      {
        question: "Will image compression reduce visual photo quality?",
        answer: "Our smart compression algorithm balances file size reduction with visual fidelity, producing clear images with drastically smaller file sizes."
      },
      {
        question: "Can I compress multiple images at the same time?",
        answer: "Yes, bulk upload multiple photos to compress them simultaneously and download them in a ZIP archive."
      },
      {
        question: "What image formats are supported?",
        answer: "It supports PNG, JPEG/JPG, WebP, and SVG images."
      },
      {
        question: "Can I adjust the target quality percentage manually?",
        answer: "Yes, use the quality slider to dial in your exact balance between file size and image sharpness."
      }
    ]
  },

  "image-resizer": {
    slug: "image-resizer",
    aboutParagraphs: [
      "Image Resizer changes image pixel dimensions (width and height) or scales images by percentage while preserving aspect ratio.",
      "Resize photos for passport dimensions, Facebook page banners, Instagram posts, or web thumbnail requirements."
    ],
    faqs: [
      {
        question: "Can I lock aspect ratio while resizing?",
        answer: "Yes, the lock aspect ratio toggle automatically calculates height when you type a new width (or vice versa)."
      },
      {
        question: "Can I resize images by percentage instead of pixels?",
        answer: "Yes, switch to Percentage mode to scale images to 50%, 75%, or any custom percentage."
      },
      {
        question: "Does resizing preserve original image quality?",
        answer: "Yes, high-quality canvas interpolation ensures smooth, sharp rescaled images."
      },
      {
        question: "Is there a preset for Nepalese passport photo dimensions?",
        answer: "Yes, select standard passport pixel dimensions (350x450 px) directly from the preset menu."
      }
    ]
  },

  "image-cropper": {
    slug: "image-cropper",
    aboutParagraphs: [
      "Image Cropper lets you visually trim photo borders and crop images using freeform selection or fixed aspect ratio presets (1:1 square, 16:9 widescreen, 4:3, 9:16 story).",
      "Perfect for cropping profile avatars, social media covers, and focus areas of photography."
    ],
    faqs: [
      {
        question: "What aspect ratio presets are available?",
        answer: "Presets include 1:1 (Square), 16:9 (Widescreen), 4:3 (Standard), 9:16 (Mobile Story), and Freeform cropping."
      },
      {
        question: "Can I zoom and pan inside the crop box?",
        answer: "Yes, drag the handles or scroll to zoom and position your image precisely inside the crop area."
      },
      {
        question: "What output format will my cropped image save as?",
        answer: "You can export cropped images as PNG, JPEG, or WebP formats."
      },
      {
        question: "Does cropping reduce original resolution?",
        answer: "Cropping trims pixels outside the selected area while preserving full resolution within the crop boundary."
      }
    ]
  },

  "image-converter": {
    slug: "image-converter",
    aboutParagraphs: [
      "Image Converter converts images seamlessly between PNG, JPEG, WebP, GIF, and BMP formats.",
      "Convert heavy PNG graphics into lightweight WebP for web development, or turn WebP images into universal JPG files for older software compatibility."
    ],
    faqs: [
      {
        question: "What happens to PNG transparency when converting to JPG?",
        answer: "Because JPG does not support transparent backgrounds, transparent pixels are filled with clean white color."
      },
      {
        question: "Why should I convert images to WebP format?",
        answer: "WebP provides superior compression, producing 25% to 34% smaller file sizes than JPEG while maintaining equivalent quality."
      },
      {
        question: "Can I batch convert multiple images at once?",
        answer: "Yes, select multiple images and convert them all to your target format in one click."
      },
      {
        question: "Is image conversion processed locally?",
        answer: "Yes, all image canvas processing runs locally in browser memory without sending data to servers."
      }
    ]
  },

  "image-to-base64": {
    slug: "image-to-base64",
    aboutParagraphs: [
      "Image to Base64 Converter converts image files into Data URI strings, HTML `<img>` src attributes, and CSS background URIs.",
      "Embed icons and small logo graphics directly inside HTML or CSS files to eliminate extra HTTP requests and speed up web page loading."
    ],
    faqs: [
      {
        question: "What formats can I copy the Base64 output in?",
        answer: "Copy formatted strings as raw Base64, Data URI (`data:image/png;base64,...`), HTML `<img>` tag, or CSS `background-image` style."
      },
      {
        question: "Does Base64 encoding increase file size?",
        answer: "Yes, Base64 encoding increases string data size by roughly 33% compared to raw binary image files."
      },
      {
        question: "When should I use Base64 images?",
        answer: "Base64 is ideal for small icons, avatars, and inline CSS assets to eliminate separate server requests."
      },
      {
        question: "Can I convert Base64 strings back to an image file?",
        answer: "Yes, paste a valid Base64 Data URI to decode and download it as a standard image file."
      }
    ]
  },

  "background-remover": {
    slug: "background-remover",
    aboutParagraphs: [
      "AI Background Remover uses browser-based machine learning (ONNX WebAssembly) to automatically erase background scenery from portraits, product photos, and graphics.",
      "Get transparent PNG outputs instantly. Processing happens on your GPU/CPU locally without uploading images to cloud servers."
    ],
    faqs: [
      {
        question: "Does background removal require server uploads?",
        answer: "No. The AI neural network model runs directly inside your browser web worker using WebAssembly."
      },
      {
        question: "What types of photos work best with AI background removal?",
        answer: "Portraits, human figures, clear product shots, and subjects with high contrast against the background deliver the crispest results."
      },
      {
        question: "Can I download the output as a transparent PNG?",
        answer: "Yes, results are exported as full resolution transparent PNG files."
      },
      {
        question: "Is there any fee or daily usage cap?",
        answer: "No, AI background removal on SajiloTools is 100% free with unlimited usages."
      }
    ]
  },

  "favicon-generator": {
    slug: "favicon-generator",
    aboutParagraphs: [
      "Favicon Generator creates complete website icon packages (favicon.ico, 16x16 PNG, 32x32 PNG, 180x180 Apple Touch Icon, Android Chrome 192x192) from any logo image.",
      "Download a structured ZIP bundle along with ready-to-paste HTML `<head>` link tags for modern browser and PWA compatibility."
    ],
    faqs: [
      {
        question: "What icon sizes are included in the generated ZIP?",
        answer: "The package includes standard `favicon.ico`, 16x16, 32x32, 180x180 Apple Touch Icon, and 192x192 / 512x512 PWA manifest icons."
      },
      {
        question: "Does it provide the HTML code to paste into my website?",
        answer: "Yes, copy pre-formatted HTML `<link rel=\"icon\">` tag code to paste directly into your site's `<head>`."
      },
      {
        question: "Should I upload a square image for best results?",
        answer: "Yes, uploading a square PNG or vector logo (512x512 px or higher) produces the sharpest favicons."
      },
      {
        question: "Are generated favicons compatible with mobile home screens?",
        answer: "Yes, Apple touch icons and Android web app manifest icons ensure your site looks great when saved to mobile home screens."
      }
    ]
  },

  "image-watermark": {
    slug: "image-watermark",
    aboutParagraphs: [
      "Image Watermark adds custom text or logo image watermarks to your photographs, graphic designs, and digital artwork.",
      "Protect your photos from copyright theft by adjusting opacity, tile patterns, font styling, and logo placement."
    ],
    faqs: [
      {
        question: "Can I add text and logo image watermarks?",
        answer: "Yes, choose between text stamps or uploading a logo image as your watermark overlay."
      },
      {
        question: "Can I watermark multiple photos simultaneously?",
        answer: "Yes, batch upload multiple photos to apply identical watermark styling across all images at once."
      },
      {
        question: "Does watermarking overwrite original files?",
        answer: "No, watermarked photos are generated as new downloadable files, preserving your original originals."
      },
      {
        question: "Can I tile watermarks repeatedly across the entire photo?",
        answer: "Yes, enable Tile Mode to repeat watermark stamps diagonally across the full image area."
      }
    ]
  },

  "image-rotate-flip": {
    slug: "image-rotate-flip",
    aboutParagraphs: [
      "Image Rotate & Flip rotates images 90°, 180°, or 270° clockwise/counter-clockwise and flips images horizontally or vertically.",
      "Fix sideways smartphone camera photos, mirror graphic elements, and correct EXIF orientation flags effortlessly."
    ],
    faqs: [
      {
        question: "Can I flip photos horizontally to create a mirror image?",
        answer: "Yes, click 'Flip Horizontal' to mirror images left-to-right or 'Flip Vertical' to invert top-to-bottom."
      },
      {
        question: "Does rotating fix sideways camera photos?",
        answer: "Yes, rotate photos 90° or 270° to correct orientation before posting online."
      },
      {
        question: "Will image quality decrease after rotation?",
        answer: "No, lossless canvas transformation retains full pixel resolution and color quality."
      },
      {
        question: "Can I export in different image formats?",
        answer: "Yes, save rotated or flipped images as PNG, JPEG, or WebP."
      }
    ]
  },

  // ── Finance Tools ───────────────────────────────────────────────────────
  "nrs-converter": {
    slug: "nrs-converter",
    aboutParagraphs: [
      "NRs Currency Converter calculates real-time exchange rates between Nepali Rupees (NPR) and major foreign currencies (USD, EUR, GBP, AUD, INR, QAR, AED, MYR).",
      "Powered by daily foreign exchange rates published by Nepal Rastra Bank (NRB), ideal for foreign remittances, travel planning, and international transactions."
    ],
    faqs: [
      {
        question: "Are foreign exchange rates official?",
        answer: "Yes, exchange rates are updated daily from official Nepal Rastra Bank (NRB) reference rates."
      },
      {
        question: "Does it convert Indian Rupees (INR / IC) to Nepali Rupees?",
        answer: "Yes, Indian Rupee conversion uses the official fixed peg rate (1 INR = 1.60 NPR)."
      },
      {
        question: "Which currencies are supported?",
        answer: "Supported currencies include USD, EUR, GBP, AUD, CAD, INR, QAR, AED, SAR, MYR, JPY, and KRW."
      },
      {
        question: "Can I view buy and sell exchange rates?",
        answer: "Yes, both NRB buying rates and selling rates are displayed in the detailed exchange table."
      }
    ]
  },

  "emi-calculator": {
    slug: "emi-calculator",
    aboutParagraphs: [
      "EMI Calculator computes Equated Monthly Installments (EMI), total interest payable, and full loan payoff schedules for home loans, auto loans, and personal loans in Nepal.",
      "Input principal loan amount in NPR, interest rate %, and loan tenure in years or months to view instant payment breakdowns and amortization schedules."
    ],
    faqs: [
      {
        question: "What is the standard EMI calculation formula?",
        answer: "EMI is calculated using: EMI = [P x R x (1+R)^N]/[(1+R)^N-1], where P is principal, R is monthly interest rate, and N is tenure in months."
      },
      {
        question: "Can I view year-by-year principal and interest breakdown?",
        answer: "Yes, the detailed amortization table shows how interest decreases and principal repayment grows over time."
      },
      {
        question: "Does it work for Nepalese bank housing and auto loans?",
        answer: "Yes, input loan rates quoted by Nepalese commercial banks to estimate exact monthly installment costs."
      },
      {
        question: "Can I enter loan tenure in months instead of years?",
        answer: "Yes, toggle tenure input between Years and Months for short-term or multi-year loans."
      }
    ]
  },

  "tax-calculator": {
    slug: "tax-calculator",
    aboutParagraphs: [
      "Nepal Income Tax & Salary TDS Calculator computes personal income tax liability and monthly Salary TDS according to the latest Inland Revenue Department (IRD) tax slabs.",
      "Calculate single vs married tax bracket rates, 1% Social Security Tax, Employee Provident Fund (EPF / SSF) deductions, and Citizen Investment Trust (CIT) tax exemptions."
    ],
    faqs: [
      {
        question: "What are the latest Nepal income tax slabs for salaried individuals?",
        answer: "For single individuals: First Rs. 5 Lakh @ 1%, Next 2 Lakh @ 10%, Next 3 Lakh @ 20%, Next 10 Lakh @ 30%, Above 20 Lakh @ 36%."
      },
      {
        question: "How does the Married assessment status affect tax calculation?",
        answer: "Married tax status increases the initial 1% tax bracket threshold to Rs. 6 Lakh, reducing total tax liability."
      },
      {
        question: "Does it calculate EPF, CIT, and SSF tax deductions?",
        answer: "Yes, contributions to EPF, CIT, and SSF are deducted from gross income up to statutory limits before calculating taxable income."
      },
      {
        question: "Can freelancers calculate 1.5% or 5% TDS?",
        answer: "Yes, switch to Freelance / Contract TDS mode to calculate withholding tax rates."
      }
    ]
  },

  "interest-calculator": {
    slug: "interest-calculator",
    aboutParagraphs: [
      "Interest Calculator computes both Simple Interest (SI) and Compound Interest (CI) returns for loans, fixed deposits, and savings investments.",
      "Calculate total interest earned, final maturity amount, and compare annual, semi-annual, quarterly, or monthly compounding frequencies."
    ],
    faqs: [
      {
        question: "What is the difference between Simple and Compound Interest?",
        answer: "Simple Interest is calculated strictly on the initial principal, whereas Compound Interest adds earned interest back to the principal for exponential growth."
      },
      {
        question: "What compounding frequencies can I choose?",
        answer: "Select Annual, Semi-Annual, Quarterly, Monthly, or Daily compounding cycles."
      },
      {
        question: "Does it show total interest earned vs principal invested?",
        answer: "Yes, an intuitive visual chart breaks down initial principal vs net interest earned."
      },
      {
        question: "Can I calculate interest for partial year periods?",
        answer: "Yes, enter tenure in exact years, months, or days for precise calculation."
      }
    ]
  },

  "pf-calculator": {
    slug: "pf-calculator",
    aboutParagraphs: [
      "Provident Fund (EPF / CIT / SSF) Calculator estimates retirement savings growth, employer contribution matches, and tax-free corpus projections in Nepal.",
      "Input monthly basic salary to project Employee Provident Fund (10% + 10%), Citizen Investment Trust (CIT), and Social Security Fund (SSF 11% + 20%) accumulations."
    ],
    faqs: [
      {
        question: "What is the standard EPF contribution rate in Nepal?",
        answer: "Standard EPF is 10% deducted from employee basic salary matched by 10% from the employer (total 20%)."
      },
      {
        question: "What is the maximum tax-exempt CIT deduction in Nepal?",
        answer: "CIT contributions up to 1/3rd of total annual income or Rs. 3,00,000 (whichever is lower) are eligible for tax exemption."
      },
      {
        question: "How does SSF (Social Security Fund) calculation work?",
        answer: "SSF comprises 11% employee contribution and 20% employer contribution calculated on monthly basic salary."
      },
      {
        question: "Does the calculator project annual compound interest on EPF?",
        answer: "Yes, it projects multi-year compound interest growth based on official EPF annual interest payout rates."
      }
    ]
  },

  "gold-silver-calculator": {
    slug: "gold-silver-calculator",
    aboutParagraphs: [
      "Nepal Gold & Silver Calculator computes accurate market prices for Fine Gold (छापावाल सुन), Tejabi Gold (तेजाबी सुन), and Silver (चाँदी) based on live FENEGOSIDA daily rates.",
      "Calculate jewelry costs across traditional Nepalese weight units including Tola (तोला), Gram (ग्राम), Aana (आना), and Lal (लाल) with optional making charges (ज्याला/जर्ती)."
    ],
    faqs: [
      {
        question: "How many Aana and Lal are in one Tola?",
        answer: "In the Nepalese jewelry market, 1 Tola = 16 Aana = 64 Lal = 11.6638 Grams."
      },
      {
        question: "Are daily gold rates updated automatically?",
        answer: "Yes, rate data is updated daily from the Federation of Nepal Gold and Silver Dealers' Association (FENEGOSIDA)."
      },
      {
        question: "Can I enter custom jeweler rates?",
        answer: "Yes, toggle to Custom Rate mode to input custom rates per tola provided by your local jeweler."
      },
      {
        question: "Does it calculate jewelry making charges (Jyala / Jarti)?",
        answer: "Yes, add fixed making charges or wastage percentages (Jarti) to calculate total final invoice cost."
      }
    ]
  },

  "sip-calculator": {
    slug: "sip-calculator",
    aboutParagraphs: [
      "SIP / Mutual Fund Calculator estimates wealth accumulation, total invested amount, and estimated capital gains from Systematic Investment Plans (SIP) in Nepalese and global mutual funds.",
      "Compare monthly SIP contributions against lump-sum investments over 1 to 30 years with interactive compound growth visualizers."
    ],
    faqs: [
      {
        question: "What is a Systematic Investment Plan (SIP)?",
        answer: "An SIP allows you to invest a fixed amount regularly (e.g. NPR 1,000 monthly) into mutual funds to benefit from rupee cost averaging and compounding."
      },
      {
        question: "Can I compare monthly SIP vs Lump-sum investment?",
        answer: "Yes, toggle between Monthly SIP and Lump-Sum mode to compare overall wealth creation."
      },
      {
        question: "How is SIP return calculated?",
        answer: "It uses the standard compound interest formula for monthly annuity installments: `M = P × ({[1 + i]^n - 1} / i) × (1 + i)`."
      },
      {
        question: "Are capital gains tax deductions included?",
        answer: "The calculator displays gross returns alongside estimated net returns after applicable capital gains tax (CGT)."
      }
    ]
  },

  "fd-calculator": {
    slug: "fd-calculator",
    aboutParagraphs: [
      "Fixed Deposit (FD) Calculator computes interest income, final maturity amount, and applicable 5% TDS tax on bank fixed deposits across Nepalese commercial and development banks.",
      "Compare annual, quarterly, and monthly interest payout options to evaluate fixed income savings plans."
    ],
    faqs: [
      {
        question: "What is the tax rate on Fixed Deposit interest in Nepal?",
        answer: "Interest earned on bank Fixed Deposits in Nepal is subject to a 5% Tax Deducted at Source (TDS)."
      },
      {
        question: "Does quarterly compounding earn more than annual compounding?",
        answer: "Yes, quarterly compounding reinvests interest four times a year, yielding a slightly higher effective annual return."
      },
      {
        question: "Can I calculate FD returns for remittance accounts?",
        answer: "Yes, input higher interest rates offered by Nepalese banks on specialized Remittance Fixed Deposit accounts."
      },
      {
        question: "Does it show net maturity amount after 5% TDS tax?",
        answer: "Yes, it displays total gross interest earned, 5% TDS tax deduction, and net cash maturity amount."
      }
    ]
  },

  "vat-calculator": {
    slug: "vat-calculator",
    aboutParagraphs: [
      "13% Nepal VAT Calculator computes Value Added Tax additions or removals from invoice prices instantly.",
      "Calculate net price excluding VAT, 13% VAT amount, and gross invoice total for business accounting, billing, and IRD tax filing."
    ],
    faqs: [
      {
        question: "What is the standard VAT rate in Nepal?",
        answer: "The standard Value Added Tax (VAT) rate enforced by the Inland Revenue Department (IRD) of Nepal is 13%."
      },
      {
        question: "How do I remove 13% VAT from a total price?",
        answer: "Select 'Remove VAT (Exclusive)' mode: Net Price = Gross Amount ÷ 1.13."
      },
      {
        question: "How do I add 13% VAT to a base net price?",
        answer: "Select 'Add VAT (Inclusive)' mode: Gross Price = Net Amount × 1.13."
      },
      {
        question: "Is this calculator suitable for issuing official VAT bills?",
        answer: "Yes, it breaks down base price and exact 13% VAT amount required for official tax invoice records."
      }
    ]
  },

  // ── Nepal Tools ─────────────────────────────────────────────────────────
  "land-converter": {
    slug: "land-converter",
    aboutParagraphs: [
      "Nepal Land Unit Converter converts traditional Nepalese land measurement units across both Ropani-Aana-Paisa-Daam (Hilly region) and Bigha-Kattha-Dhur (Terai region) systems, into Square Feet and Square Meters.",
      "Essential for real estate buyers, landowners, surveyors, and legal documentation in Nepal."
    ],
    faqs: [
      {
        question: "What is 1 Ropani in Square Feet?",
        answer: "1 Ropani is equal to 5,476 square feet (16 Aana = 64 Paisa = 256 Daam)."
      },
      {
        question: "What is 1 Bigha in Kattha and Dhur?",
        answer: "1 Bigha is equal to 20 Kattha (400 Dhur = 72,900 square feet)."
      },
      {
        question: "Can I convert Ropani directly to Bigha?",
        answer: "Yes, selecting Ropani automatically converts the exact equivalent in Bigha, Square Feet, and Square Meters."
      },
      {
        question: "Which land system is used in Kathmandu Valley?",
        answer: "Kathmandu Valley and hilly districts use the Ropani-Aana-Paisa-Daam system, while Terai districts use Bigha-Kattha-Dhur."
      }
    ]
  },

  "nepali-translator": {
    slug: "nepali-translator",
    aboutParagraphs: [
      "English ↔ Nepali Translator provides instant translation between English text and Nepali Devanagari script.",
      "Designed for students, travelers, and professionals needing fast text translation with copy and audio pronunciation support."
    ],
    faqs: [
      {
        question: "Is this translator free?",
        answer: "Yes, it is 100% free for translating phrases, sentences, and paragraphs."
      },
      {
        question: "Can I translate Nepali Devanagari text back to English?",
        answer: "Yes, toggle the direction arrow button to translate from Nepali to English."
      },
      {
        question: "Does it support text-to-speech audio pronunciation?",
        answer: "Yes, click the speaker icon to listen to correct pronunciation of translated phrases."
      },
      {
        question: "Is my translated text stored on remote servers?",
        answer: "No, text is processed securely in client sessions and is not stored."
      }
    ]
  },

  "nepali-date-converter": {
    slug: "nepali-date-converter",
    aboutParagraphs: [
      "Nepali Date Converter & Age Calculator performs accurate conversion between Bikram Sambat (वि.सं.) and Gregorian AD (ई.सं.) calendars from 2000 BS to 2090 BS.",
      "Includes a built-in Age Calculator that computes your exact age in years, months, days, total days alive, and next birthday countdown in both Nepali and English date systems. Crucial for filling out Nepalese government forms, passport applications, and academic admissions."
    ],
    faqs: [
      {
        question: "How accurate is the Bikram Sambat date conversion?",
        answer: "Our engine uses accurate Panchang calculations for Nepali months ranging from 2000 BS to 2090 BS."
      },
      {
        question: "How does the Age Calculator feature work?",
        answer: "Enter your date of birth in either BS or AD to calculate your exact age breakdown and birthday countdown."
      },
      {
        question: "Why does Bikram Sambat differ from the English AD calendar?",
        answer: "Bikram Sambat is a solar Hindu calendar that is approximately 56.7 years ahead of the Gregorian calendar."
      },
      {
        question: "Why do Nepali months have varying numbers of days (29 to 32 days)?",
        answer: "Bikram Sambat month lengths are determined by astronomical movement of the sun across zodiac signs rather than fixed month lengths."
      }
    ],
    howToSteps: [
      "Select conversion mode (BS to AD or AD to BS) or switch to Age Calculator mode.",
      "Choose Year, Month, and Day.",
      "View converted date result along with the day of the week, or inspect your exact age breakdown."
    ]
  },

  "nepali-unicode": {
    slug: "nepali-unicode",
    aboutParagraphs: [
      "Nepali Unicode Converter allows you to type in phonetically Romanized English (e.g. 'namaste') and converts it instantly into official Devanagari Unicode text (नमस्ते).",
      "Universally compatible with Facebook, official government portals, Word documents, and mobile messaging."
    ],
    faqs: [
      {
        question: "How does Romanized Nepali typing work?",
        answer: "Type words using English letters based on how they sound (e.g. 'nepal' -> 'नेपाल') and the engine converts them live."
      },
      {
        question: "Is Unicode text compatible with Facebook, Word, and government forms?",
        answer: "Yes, Unicode is universally supported across all modern operating systems, social media, and Nepalese online forms."
      },
      {
        question: "Can I copy converted text with one click?",
        answer: "Yes, click the 'Copy Unicode' button to copy text directly to your clipboard."
      },
      {
        question: "How do I type special conjunct letters like 'क्ष' or 'ज्ञ'?",
        answer: "Use standard phonetic combinations: 'ksha' -> 'क्ष', 'gya' -> 'ज्ञ', 'tra' -> 'त्र'."
      }
    ]
  },

  "nepali-number-words": {
    slug: "nepali-number-words",
    aboutParagraphs: [
      "Nepali Number to Words Converter converts numerical amounts into formal Nepali Lakh/Crore words in both English and Devanagari script.",
      "Ideal for writing bank cheques, financial contracts, tax receipts, and official agreements in Nepal."
    ],
    faqs: [
      {
        question: "Does it convert figures into Lakhs and Crores?",
        answer: "Yes, it uses the South Asian numbering system (Lakhs and Crores) standard in Nepal."
      },
      {
        question: "Does it generate text in both Nepali Devanagari and English?",
        answer: "Yes, it outputs formal wording in both English (e.g. Five Lakh Fifty Thousand) and Nepali Devanagari (पाँच लाख पचास हजार)."
      },
      {
        question: "Does it format currency amounts for bank cheques?",
        answer: "Yes, it includes optional 'Rupees ... Only' and 'पैयाँ मात्र' suffixes ideal for cheque writing."
      },
      {
        question: "How does it handle decimal paisa amounts?",
        answer: "Decimal values are formatted automatically as Paisa (e.g. 50 Paisa / ५० पैसा)."
      }
    ]
  },

  "nepali-calendar": {
    slug: "nepali-calendar",
    aboutParagraphs: [
      "Nepali Calendar (Bikram Sambat) provides an interactive monthly calendar grid featuring national public holidays, Nepalese festivals (Dashain, Tihar, Teej), Saturdays, and Gregorian AD date overlays.",
      "Stay updated on Nepalese official calendar dates, government holiday lists, and upcoming festival schedules."
    ],
    faqs: [
      {
        question: "Are official Nepal government public holidays marked?",
        answer: "Yes, national public holidays, festival dates, and official Saturdays are highlighted with holiday descriptions."
      },
      {
        question: "Does the calendar show corresponding Gregorian AD dates?",
        answer: "Yes, every day box displays both the Bikram Sambat date and the corresponding AD Gregorian date."
      },
      {
        question: "Can I navigate across different years and months?",
        answer: "Yes, navigate seamlessly between months and years across the Bikram Sambat calendar spectrum."
      },
      {
        question: "Are Tithi and festival details displayed?",
        answer: "Yes, click on any date to view major festival names and calendar notes."
      }
    ]
  },

  "traditional-unit-converter": {
    slug: "traditional-unit-converter",
    aboutParagraphs: [
      "Traditional Nepali Unit Converter converts historical Nepalese weight units (Dharni, Pau, Seer, Tola) and grain volume units (Muri, Pathi, Mana, Mutthi) into standard Kilograms and Liters.",
      "Valuable for agricultural trade, local market shopping, cultural research, and traditional Nepalese cooking."
    ],
    faqs: [
      {
        question: "How many Kilograms is 1 Dharni?",
        answer: "In traditional Nepalese weight measurement, 1 Dharni = 12 Pau = 2.3328 Kilograms (approx 2.4 kg)."
      },
      {
        question: "How many Mana are in 1 Pathi and 1 Muri?",
        answer: "1 Pathi = 8 Mana (approx 4.54 Liters or 3.63 kg of grain). 1 Muri = 20 Pathi = 160 Mana."
      },
      {
        question: "How many Grams is 1 Pau?",
        answer: "1 Pau is equal to approximately 194.4 Grams (1/12th of a Dharni)."
      },
      {
        question: "Does it convert traditional volume units to Liters?",
        answer: "Yes, grain volume units like Pathi and Mana are converted directly into Liters."
      }
    ]
  },

  "vehicle-tax-calculator": {
    slug: "vehicle-tax-calculator",
    aboutParagraphs: [
      "Vehicle Blue Book Tax Calculator estimates annual road tax, registration renewal fees, and penalty fines for motorcycles, private cars, electric vehicles (EVs), and commercial transport across all 7 provinces of Nepal.",
      "Select your province (Bagmati, Gandaki, Lumbini, etc.) and engine capacity (CC / kW) to view exact annual tax breakdowns prior to visiting the Transport Management Office (Yatayat)."
    ],
    faqs: [
      {
        question: "Does road tax vary across different provinces in Nepal?",
        answer: "Yes, provincial governments set individual annual vehicle tax rates; select your registered province for accurate rates."
      },
      {
        question: "How is motorcycle tax calculated?",
        answer: "Motorcycle tax is determined by engine displacement categories (Up to 125cc, 126-160cc, 161-250cc, 251-400cc, Above 400cc)."
      },
      {
        question: "Does it calculate Electric Vehicle (EV) annual tax?",
        answer: "Yes, EV tax rates are calculated based on motor power output ranges in kilowatts (kW)."
      },
      {
        question: "Does it include overdue renewal penalty fines?",
        answer: "Yes, select overdue fiscal years to calculate late renewal penalty percentages (32%, 50%, 100% fine brackets)."
      }
    ]
  },

  "ward-municipality-lookup": {
    slug: "ward-municipality-lookup",
    aboutParagraphs: [
      "Ward & Municipality Lookup is a administrative directory covering all 753 local government units (Metropolitan, Sub-Metropolitan, Municipality, Rural Municipality) across Nepal's 77 districts.",
      "Search any local body to view total ward counts, administrative category, district, province, and official address formatting."
    ],
    faqs: [
      {
        question: "How many local government units exist in Nepal?",
        answer: "Nepal has 753 local government units comprising 6 Metropolitan Cities, 11 Sub-Metropolitan Cities, 276 Municipalities, and 460 Rural Municipalities (Gaunpalika)."
      },
      {
        question: "Can I find ward counts for any municipality?",
        answer: "Yes, search any municipality or gaunpalika to view its total number of wards and administrative headquarter location."
      },
      {
        question: "Does it provide official Nepalese address formats?",
        answer: "Yes, it formats official addresses (e.g. Ward No. X, Municipality Name, District, Province Name) suitable for citizenship and passport applications."
      },
      {
        question: "Can I filter by Province or District?",
        answer: "Yes, select any of the 7 provinces or 77 districts to list all local administrative units within that region."
      }
    ]
  },

  // ── Everyday Tools ──────────────────────────────────────────────────────
  "unit-converter": {
    slug: "unit-converter",
    aboutParagraphs: [
      "Universal Unit Converter is an all-in-one measurement conversion utility that handles Length, Weight, Temperature, Volume, Area, Speed, Time, and Data Storage units in real time.",
      "Whether you are solving physics problems, cooking recipes, converting land measurements, or calculating binary data storage sizes, this tool provides instant bidirectional conversion with configurable decimal precision."
    ],
    faqs: [
      {
        question: "How does temperature conversion work?",
        answer: "Temperature conversions use exact scientific formulas (e.g., °F = °C × 9/5 + 32, K = °C + 273.15) rather than simple linear multipliers."
      },
      {
        question: "Is Data Storage calculated on a 1024 binary basis?",
        answer: "Yes, data units use the standard binary 1024 basis (1 KB = 1024 Bytes, 1 MB = 1024 KB), clearly labeled for technical accuracy."
      },
      {
        question: "Can I swap the conversion direction easily?",
        answer: "Yes, click the Swap button between the input fields to instantly interchange the source and target units."
      },
      {
        question: "Can I adjust decimal precision?",
        answer: "Yes, adjust output precision from 2 to 6 decimal places."
      }
    ],
    howToSteps: [
      "Select your unit category tab (Length, Weight, Temperature, etc.).",
      "Choose your source unit and target unit from the dropdown menus.",
      "Enter a value in either field to view real-time converted results."
    ]
  },

  "percentage-calculator": {
    slug: "percentage-calculator",
    aboutParagraphs: [
      "Percentage Calculator is a multi-mode mathematical utility that handles standard percentage calculations, percentage difference, and percentage increase or decrease.",
      "Designed for students, business owners, and shoppers, it shows step-by-step formula explanations for every result."
    ],
    faqs: [
      {
        question: "What calculation modes are supported?",
        answer: "It supports finding X% of Y, calculating what percent X is of Y, and finding percentage change/growth between two numbers."
      },
      {
        question: "Does it show percentage increase and decrease?",
        answer: "Yes, entering two values automatically calculates both the absolute difference and whether it represents an increase or decrease."
      },
      {
        question: "Is the calculation step-by-step formula shown?",
        answer: "Yes, every calculation displays the mathematical equation used to derive the result."
      },
      {
        question: "Can I calculate discount percentages for shopping?",
        answer: "Yes, use the percentage decrease mode or our dedicated Discount & Markup Calculator."
      }
    ],
    howToSteps: [
      "Choose the calculation mode tab you need.",
      "Fill in the required input numbers.",
      "View the instant calculated percentage result and formula breakdown."
    ]
  },

  "age-calculator": {
    slug: "age-calculator",
    aboutParagraphs: [
      "Age Calculator (AD) calculates your exact age in years, months, and days based on your Gregorian birthdate.",
      "It also displays total days lived, total weeks/hours lived, and a countdown to your next upcoming birthday."
    ],
    faqs: [
      {
        question: "How is exact age in months and days calculated?",
        answer: "It computes exact calendar date differences, adjusting for varying month lengths and leap years."
      },
      {
        question: "Looking for Bikram Sambat (BS) age calculation?",
        answer: "Use our Nepali Date Converter & Age Calculator tool for full Bikram Sambat (BS) calendar age conversion."
      },
      {
        question: "Does it show a countdown to the next birthday?",
        answer: "Yes, it shows exact remaining months, days, hours, and seconds until your next birthday."
      },
      {
        question: "Can I see total days, hours, and minutes lived?",
        answer: "Yes, detailed life statistics display your total lifetime broken down into total days, weeks, and hours."
      }
    ],
    howToSteps: [
      "Select your Date of Birth in the date picker.",
      "View your exact age broken down by years, months, and days.",
      "Check total days alive and your next birthday countdown."
    ]
  },

  "gpa-percentage-converter": {
    slug: "gpa-percentage-converter",
    aboutParagraphs: [
      "GPA to Percentage Converter converts academic Grade Point Average (GPA) to percentage and vice versa using official Nepal National Examination Board (NEB) and university standards.",
      "Under current NEB guidelines, Percentage = (GPA × 25) - 12.5. You can also select 4.0 linear scale or custom scale conversions for university transcripts."
    ],
    faqs: [
      {
        question: "What is the official NEB formula for GPA to percentage in Nepal?",
        answer: "The standard NEB formula used for SEE and Class 12 (+2) transcripts is: Percentage = (GPA × 25) - 12.5."
      },
      {
        question: "Can I convert Percentage back into GPA?",
        answer: "Yes, typing a percentage automatically calculates the equivalent GPA and letter grade (A+, A, B+, etc.)."
      },
      {
        question: "Does it support the 4.0 linear GPA scale used by universities?",
        answer: "Yes, switch presets to convert using 4.0 linear scale standard used by TU, KU, and foreign universities."
      },
      {
        question: "Are NEB letter grade breakdowns included?",
        answer: "Yes, letter grades (A+, A, B+, B, C+, C, D) are displayed alongside equivalent percentage ranges."
      }
    ],
    howToSteps: [
      "Choose your grading scale preset (NEB 4.0 Standard, Linear 4.0, or Custom).",
      "Enter your GPA or Percentage score.",
      "Instantly see converted percentage, GPA equivalent, and letter grade."
    ]
  },

  "bmi-calculator": {
    slug: "bmi-calculator",
    aboutParagraphs: [
      "BMI Calculator computes Body Mass Index (BMI) using metric (cm, kg) or imperial (feet, inches, lbs) measurements.",
      "Results are presented with neutral, clinical World Health Organization (WHO) reference categories for adults."
    ],
    faqs: [
      {
        question: "What are the WHO BMI categories?",
        answer: "Underweight (< 18.5), Normal weight (18.5 – 24.9), Overweight (25 – 29.9), and Obese (≥ 30)."
      },
      {
        question: "Can I use both Metric and Imperial units?",
        answer: "Yes, you can toggle between centimeters/kilograms and feet/inches/pounds seamlessly."
      },
      {
        question: "Does the calculator indicate healthy target weight ranges?",
        answer: "Yes, based on your height, it calculates your ideal normal weight range in kilograms or pounds."
      },
      {
        question: "Is BMI suitable for athletes and bodybuilders?",
        answer: "BMI is a general adult screening tool; highly muscular individuals may register high BMI without excess body fat."
      }
    ],
    howToSteps: [
      "Select Metric or Imperial measurement unit toggle.",
      "Enter your Height and Weight.",
      "View your calculated BMI score and clinical WHO reference category."
    ]
  },

  "discount-calculator": {
    slug: "discount-calculator",
    aboutParagraphs: [
      "Discount & Markup Calculator calculates final sale price after discount, original price prior to discount, or profit markup percentages.",
      "Ideal for online shoppers, retail shopkeepers, and merchants managing promotional discounts and sales margins."
    ],
    faqs: [
      {
        question: "Can I calculate the original price if I only know the sale price?",
        answer: "Yes, select the 'Find Original Price' mode to calculate the pre-discount price from a sale price and percentage off."
      },
      {
        question: "Does it calculate profit markup percentage?",
        answer: "Yes, enter cost price and selling price to determine profit margin and markup percentage."
      },
      {
        question: "Can I stack double discounts (e.g. 20% + 10% off)?",
        answer: "Yes, use the double discount mode to compute sequential promotional discounts."
      },
      {
        question: "Does it show exact monetary savings?",
        answer: "Yes, it displays total currency saved alongside final discounted price."
      }
    ],
    howToSteps: [
      "Select your calculation mode (Discounted Price, Original Price, or Markup %).",
      "Enter the price and percentage values.",
      "View the final price, money saved, and total breakdown."
    ]
  }
};

/**
 * Retrieves unique content for a given tool slug, falling back to clean structured defaults if pending.
 */
export function getToolContent(slug: string, toolName: string): ToolContent {
  const existing = TOOL_CONTENT_MAP[slug];
  if (existing) return existing;

  // Fallback for tools without explicit content entries
  return {
    slug,
    aboutParagraphs: [
      `${toolName} is a free, browser-based online utility designed to provide fast, reliable, and precise results without requiring any software installation or account registration.`,
      `Built as part of the SajiloTools suite, ${toolName} helps users in Nepal and globally perform essential tasks directly in their web browser with complete privacy and zero data collection.`
    ],
    faqs: [
      {
        question: `Is ${toolName} free to use?`,
        answer: `Yes, ${toolName} is 100% free with no subscription, daily limits, or hidden fees required.`
      },
      {
        question: `Is my data private when using ${toolName}?`,
        answer: `Yes, your data is processed locally inside your browser session and is never stored or sent to remote servers.`
      },
      {
        question: `Do I need to install any software or plugin?`,
        answer: `No installation is needed. ${toolName} runs directly in any modern web browser on desktop, tablet, and mobile devices.`
      },
      {
        question: `Can I use ${toolName} on mobile phones?`,
        answer: `Yes, SajiloTools is fully responsive and optimized for mobile browsers on Android and iOS.`
      }
    ]
  };
}
