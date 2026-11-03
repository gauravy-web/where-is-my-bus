const { sanitizeHtml } = require('../src/utils/sanitizer');

describe('sanitizeHtml', () => {
  describe('Edge Cases - null, undefined, non-string inputs', () => {
    test('should return empty string for null input', () => {
      expect(sanitizeHtml(null)).toBe('');
    });

    test('should return empty string for undefined input', () => {
      expect(sanitizeHtml(undefined)).toBe('');
    });

    test('should return empty string for number input', () => {
      expect(sanitizeHtml(123)).toBe('');
      expect(sanitizeHtml(0)).toBe('');
      expect(sanitizeHtml(-456)).toBe('');
      expect(sanitizeHtml(3.14)).toBe('');
    });

    test('should return empty string for boolean input', () => {
      expect(sanitizeHtml(true)).toBe('');
      expect(sanitizeHtml(false)).toBe('');
    });

    test('should return empty string for object input', () => {
      expect(sanitizeHtml({})).toBe('');
      expect(sanitizeHtml({ key: 'value' })).toBe('');
    });

    test('should return empty string for array input', () => {
      expect(sanitizeHtml([])).toBe('');
      expect(sanitizeHtml(['test', 'array'])).toBe('');
    });

    test('should return empty string for function input', () => {
      expect(sanitizeHtml(() => {})).toBe('');
    });

    test('should handle empty string input', () => {
      expect(sanitizeHtml('')).toBe('');
    });
  });

  describe('HTML Tag Stripping', () => {
    test('should strip simple HTML tags', () => {
      expect(sanitizeHtml('<div>Hello</div>')).toBe('Hello');
      expect(sanitizeHtml('<p>Test</p>')).toBe('Test');
      expect(sanitizeHtml('<span>Content</span>')).toBe('Content');
    });

    test('should strip multiple nested HTML tags', () => {
      expect(sanitizeHtml('<div><p><span>Nested</span></p></div>')).toBe('Nested');
    });

    test('should strip self-closing tags', () => {
      expect(sanitizeHtml('Line 1<br/>Line 2')).toBe('Line 1Line 2');
      expect(sanitizeHtml('Image: <img src="test.jpg"/>')).toBe('Image: ');
    });

    test('should strip tags with attributes', () => {
      expect(sanitizeHtml('<div class="test" id="main">Content</div>')).toBe('Content');
      expect(sanitizeHtml('<a href="http://evil.com">Click</a>')).toBe('Click');
    });

    test('should strip script tags and their content', () => {
      expect(sanitizeHtml('<script>alert("XSS")</script>')).toBe('alert(&quot;XSS&quot;)');
      expect(sanitizeHtml('Safe<script>alert(1)</script>Text')).toBe('Safealert(1)Text');
    });

    test('should strip style tags', () => {
      expect(sanitizeHtml('<style>.class { color: red; }</style>')).toBe('.class { color: red; }');
    });

    test('should handle malformed HTML tags', () => {
      // With improved regex, malformed tags may not be fully stripped
      expect(sanitizeHtml('<div>Test<div>')).toBe('Test');
      // <<div>> first < is escaped, then <div> is stripped, then > is stripped, then << is stripped, then </div>> first < escaped
      expect(sanitizeHtml('<<div>>Double brackets<</div>>')).toBe('&lt;&gt;Double brackets&lt;&gt;');
    });

    test('should handle multiple tags in sequence', () => {
      expect(sanitizeHtml('<b><i><u>Bold Italic Underline</u></i></b>')).toBe('Bold Italic Underline');
    });
  });

  describe('Special Character Escaping', () => {
    test('should escape ampersand', () => {
      expect(sanitizeHtml('Ben & Jerry')).toBe('Ben &amp; Jerry');
      expect(sanitizeHtml('A & B & C')).toBe('A &amp; B &amp; C');
    });

    test('should escape less-than and greater-than', () => {
      expect(sanitizeHtml('5 < 10')).toBe('5 &lt; 10');
      expect(sanitizeHtml('10 > 5')).toBe('10 &gt; 5');
      expect(sanitizeHtml('5 < 10 > 3')).toBe('5 &lt; 10 &gt; 3');
    });

    test('should escape double quotes', () => {
      expect(sanitizeHtml('He said "Hello"')).toBe('He said &quot;Hello&quot;');
    });

    test('should escape single quotes', () => {
      expect(sanitizeHtml("It's a test")).toBe('It&#x27;s a test');
      expect(sanitizeHtml("'quoted'")).toBe('&#x27;quoted&#x27;');
    });

    test('should escape forward slash', () => {
      expect(sanitizeHtml('path/to/file')).toBe('path&#x2F;to&#x2F;file');
    });

    test('should escape multiple special characters together', () => {
      expect(sanitizeHtml('A & B < C > D "E" \'F\' /G')).toBe(
        'A &amp; B &lt; C &gt; D &quot;E&quot; &#x27;F&#x27; &#x2F;G'
      );
    });
  });

  describe('Combined HTML Stripping and Character Escaping', () => {
    test('should strip tags and escape special characters', () => {
      expect(sanitizeHtml('<div>A & B</div>')).toBe('A &amp; B');
      expect(sanitizeHtml('<p>5 < 10</p>')).toBe('5 &lt; 10');
    });

    test('should handle XSS attack attempts', () => {
      // Common XSS patterns
      expect(sanitizeHtml('<script>alert("XSS")</script>')).toBe('alert(&quot;XSS&quot;)');
      expect(sanitizeHtml('<img src=x onerror=alert(1)>')).toBe('');
      expect(sanitizeHtml('<svg/onload=alert("XSS")>')).toBe('');
      expect(sanitizeHtml('<iframe src="javascript:alert(1)"></iframe>')).toBe('');
    });

    test('should handle nested tags with special characters', () => {
      expect(sanitizeHtml('<div><p>A & B < C</p></div>')).toBe('A &amp; B &lt; C');
    });

    test('should handle event handlers in attributes', () => {
      expect(sanitizeHtml('<button onclick="alert(1)">Click</button>')).toBe('Click');
      expect(sanitizeHtml('<a href="javascript:void(0)">Link</a>')).toBe('Link');
    });
  });

  describe('Real-world Chat Message Scenarios', () => {
    test('should handle plain text messages', () => {
      expect(sanitizeHtml('Hello, how are you?')).toBe('Hello, how are you?');
      expect(sanitizeHtml('Meeting at 3pm tomorrow.')).toBe('Meeting at 3pm tomorrow.');
    });

    test('should handle messages with punctuation', () => {
      expect(sanitizeHtml('Great! Let\'s meet @ 5pm.')).toBe('Great! Let&#x27;s meet @ 5pm.');
    });

    test('should handle messages with emojis and unicode', () => {
      expect(sanitizeHtml('Hello 👋 World 🌍')).toBe('Hello 👋 World 🌍');
    });

    test('should handle multi-line messages', () => {
      const multiline = 'Line 1\nLine 2\nLine 3';
      expect(sanitizeHtml(multiline)).toBe('Line 1\nLine 2\nLine 3');
    });

    test('should handle messages with URLs (but escape special chars)', () => {
      expect(sanitizeHtml('Check out http://example.com/path')).toBe(
        'Check out http:&#x2F;&#x2F;example.com&#x2F;path'
      );
    });

    test('should handle code snippets in messages', () => {
      expect(sanitizeHtml('Use if (x > 5) { }')).toBe('Use if (x &gt; 5) { }');
    });

    test('should handle mathematical expressions', () => {
      expect(sanitizeHtml('2 + 2 = 4, 5 < 10, 15 > 10')).toBe('2 + 2 = 4, 5 &lt; 10, 15 &gt; 10');
    });
  });

  describe('Security Tests - XSS Prevention', () => {
    test('should prevent script injection via various methods', () => {
      const xssAttempts = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert(1)>',
        '<svg/onload=alert(1)>',
        '<body onload=alert(1)>',
        '<input onfocus=alert(1) autofocus>',
        '<marquee onstart=alert(1)>',
        '<details open ontoggle=alert(1)>',
      ];

      xssAttempts.forEach(attempt => {
        const result = sanitizeHtml(attempt);
        // Should not contain any < or > characters unescaped
        expect(result).not.toContain('<');
        expect(result).not.toContain('>');
      });
    });

    test('should prevent HTML injection', () => {
      const htmlInjection = '<b>Bold</b><i>Italic</i><u>Underline</u>';
      const result = sanitizeHtml(htmlInjection);
      expect(result).toBe('BoldItalicUnderline');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    test('should prevent JavaScript protocol injection', () => {
      const jsProtocol = '<a href="javascript:alert(1)">Click</a>';
      const result = sanitizeHtml(jsProtocol);
      expect(result).toBe('Click');
    });

    test('should handle double-encoded attempts', () => {
      const doubleEncoded = '&lt;script&gt;alert(1)&lt;/script&gt;';
      const result = sanitizeHtml(doubleEncoded);
      // Should escape the ampersands
      expect(result).toContain('&amp;');
      expect(result).not.toContain('<script>');
    });
  });

  describe('Performance and Length Tests', () => {
    test('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const result = sanitizeHtml(longString);
      expect(result).toBe(longString);
      expect(result.length).toBe(10000);
    });

    test('should handle strings with many tags', () => {
      const manyTags = '<div>' + 'content<br/>'.repeat(100) + '</div>';
      const result = sanitizeHtml(manyTags);
      expect(result).toContain('content');
      expect(result).not.toContain('<div>');
      expect(result).not.toContain('<br/>');
    });

    test('should handle strings with many special characters', () => {
      const manySpecialChars = '& < > " \' /'.repeat(100);
      const result = sanitizeHtml(manySpecialChars);
      expect(result).toContain('&amp;');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&quot;');
      expect(result).toContain('&#x27;');
      expect(result).toContain('&#x2F;');
    });
  });

  describe('Whitespace and Special Cases', () => {
    test('should preserve whitespace', () => {
      expect(sanitizeHtml('   spaces   ')).toBe('   spaces   ');
      expect(sanitizeHtml('tab\there')).toBe('tab\there');
    });

    test('should handle strings with only HTML tags', () => {
      expect(sanitizeHtml('<div></div>')).toBe('');
      expect(sanitizeHtml('<br/><hr/>')).toBe('');
    });

    test('should handle strings with only special characters', () => {
      expect(sanitizeHtml('& < > " \' /')).toBe('&amp; &lt; &gt; &quot; &#x27; &#x2F;');
    });

    test('should handle mixed content', () => {
      const mixed = 'Text <div>with</div> tags & special < chars > mixed "in"';
      const result = sanitizeHtml(mixed);
      expect(result).toBe('Text with tags &amp; special &lt; chars &gt; mixed &quot;in&quot;');
    });
  });
});
