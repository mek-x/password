function findAll(sel) { return [].slice.call(document.querySelectorAll(sel)); }
function find(sel) { return document.querySelector(sel); }

function validate(form) {
	return find('#site-tag').value && find('#master-key').value;
}

function generatePassword(len) {
	const hashword = find('#hash-word');
	const pw = PassHashCommon.generateHashWord(
		find('#site-tag').value,
		find('#master-key').value,
		len,true,false,true,true,false
	);
	hashword.value = pw;
	hashword.select();
	hashword.focus();
	if (navigator.clipboard) {
		navigator.clipboard.writeText(pw);
	} else {
		console.warn('Cannot copy to clipboard');
	}
}

function update() {
	var noSpecial = find("#noSpecial").checked;
	var digitsOnly = find("#digitsOnly").checked;
	find('#punctuation').disabled = noSpecial || digitsOnly;
	find("#digit"      ).disabled = digitsOnly;
	find("#mixedCase"  ).disabled = digitsOnly;
	find("#noSpecial"  ).disabled = digitsOnly;
}

function generateCustomPassword() {
	const siteTag   = find('#site-tag');
	const masterKey = find('#master-key');
	const hashWord  = find('#hash-word');
	const submit    = find('#submit');
	const requireDigit       = find("#digit").checked;
	const requirePunctuation = find("#punctuation").checked;
	const requireMixedCase   = find("#mixedCase").checked;
	const restrictSpecial    = find("#noSpecial").checked;
	const restrictDigits     = find("#digitsOnly").checked;
	const hashWordSize = Number(find("input[name='size']:checked").value);
	const pw = PassHashCommon.generateHashWord(
	                   siteTag.value,
	                   masterKey.value,
	                   hashWordSize,
	                   requireDigit,
	                   requirePunctuation,
	                   requireMixedCase,
	                   restrictSpecial,
	                   restrictDigits);
	hashWord.value = pw;
	hashWord.select();
	hashWord.focus();
	if (navigator.clipboard) {
		navigator.clipboard.writeText(pw);
	} else {
		console.warn('Cannot copy to clipboard');
	}
}

/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_sha1(s){return binb2hex(core_sha1(str2binb(s),s.length * chrsz));}
function b64_sha1(s){return binb2b64(core_sha1(str2binb(s),s.length * chrsz));}
function str_sha1(s){return binb2str(core_sha1(str2binb(s),s.length * chrsz));}
function hex_hmac_sha1(key, data){ return binb2hex(core_hmac_sha1(key, data));}
function b64_hmac_sha1(key, data){ return binb2b64(core_hmac_sha1(key, data));}
function str_hmac_sha1(key, data){ return binb2str(core_hmac_sha1(key, data));}

/*
 * Perform a simple self-test to see if the VM is working
 */
function sha1_vm_test()
{
	return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
}

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function core_sha1(x, len)
{
	/* append padding */
	/* SC - Get rid of warning */
	var i = (len >> 5);
	if (x[i] == undefined)
			x[i]  = 0x80 << (24 - len % 32);
	else
			x[i] |= 0x80 << (24 - len % 32);
	/*x[len >> 5] |= 0x80 << (24 - len % 32);*/
	x[((len + 64 >> 9) << 4) + 15] = len;

	var w = Array(80);
	var a =  1732584193;
	var b = -271733879;
	var c = -1732584194;
	var d =  271733878;
	var e = -1009589776;

	for(var i = 0; i < x.length; i += 16)
	{
		var olda = a;
		var oldb = b;
		var oldc = c;
		var oldd = d;
		var olde = e;

		for(var j = 0; j < 80; j++)
		{
			if(j < 16) w[j] = x[i + j];
			else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
			var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
											 safe_add(safe_add(e, w[j]), sha1_kt(j)));
			e = d;
			d = c;
			c = rol(b, 30);
			b = a;
			a = t;
		}

		a = safe_add(a, olda);
		b = safe_add(b, oldb);
		c = safe_add(c, oldc);
		d = safe_add(d, oldd);
		e = safe_add(e, olde);
	}
	return Array(a, b, c, d, e);

}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d)
{
	if(t < 20) return (b & c) | ((~b) & d);
	if(t < 40) return b ^ c ^ d;
	if(t < 60) return (b & c) | (b & d) | (c & d);
	return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t)
{
	return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
				 (t < 60) ? -1894007588 : -899497514;
}

/*
 * Calculate the HMAC-SHA1 of a key and some data
 */
function core_hmac_sha1(key, data)
{
	var bkey = str2binb(key);
	if(bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);

	var ipad = Array(16), opad = Array(16);
	for(var i = 0; i < 16; i++)
	{
		/* SC - Get rid of warning */
		var k = (bkey[i] != undefined ? bkey[i] : 0);
		ipad[i] = k ^ 0x36363636;
		opad[i] = k ^ 0x5C5C5C5C;
/*  ipad[i] = bkey[i] ^ 0x36363636;
		opad[i] = bkey[i] ^ 0x5C5C5C5C;*/
	}

	var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
	return core_sha1(opad.concat(hash), 512 + 160);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
	var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt)
{
	return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert an 8-bit or 16-bit string to an array of big-endian words
 * In 8-bit function, characters >255 have their hi-byte silently ignored.
 */
function str2binb(str)
{
	var bin = Array();
	var mask = (1 << chrsz) - 1;
	/* SC - Get rid of warnings */
	for(var i = 0; i < str.length * chrsz; i += chrsz)
	{
		if (bin[i>>5] != undefined)
			bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i%32);
		else
			bin[i>>5]  = (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i%32);
	}
	/*for(var i = 0; i < str.length * chrsz; i += chrsz)
			bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i%32);*/
	return bin;
}

/*
 * Convert an array of big-endian words to a string
 */
function binb2str(bin)
{
	var str = "";
	var mask = (1 << chrsz) - 1;
	for(var i = 0; i < bin.length * 32; i += chrsz)
		str += String.fromCharCode((bin[i>>5] >>> (32 - chrsz - i%32)) & mask);
	return str;
}

/*
 * Convert an array of big-endian words to a hex string.
 */
function binb2hex(binarray)
{
	var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
	var str = "";
	for(var i = 0; i < binarray.length * 4; i++)
	{
		str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
					 hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
	}
	return str;
}

/*
 * Convert an array of big-endian words to a base-64 string
 */
function binb2b64(binarray)
{
	var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var str = "";
	for(var i = 0; i < binarray.length * 4; i += 3)
	{
		/* SC - Get rid of warning */
		var b1 = binarray[i   >> 2] != undefined ? ((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16 : 0;
		var b2 = binarray[i+1 >> 2] != undefined ? ((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8  : 0;
		var b3 = binarray[i+2 >> 2] != undefined ? ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF)       : 0;
		var triplet = b1 | b2 | b3;
		/*var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
								| (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
								|  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);*/
		for(var j = 0; j < 4; j++)
		{
			if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
			else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
		}
	}
	return str;
}

/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Password Hasher
 *
 * The Initial Developer of the Original Code is Steve Cooper.
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): (none)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var PassHashCommon =
{

		// IMPORTANT: This function should be changed carefully.  It must be
		// completely deterministic and consistent between releases.  Otherwise
		// users would be forced to update their passwords.  In other words, the
		// algorithm must always be backward-compatible.  It's only acceptable to
		// violate backward compatibility when new options are used.
		// SECURITY: The optional adjustments are positioned and calculated based
		// on the sum of all character codes in the raw hash string.  So it becomes
		// far more difficult to guess the injected special characters without
		// knowing the master key.
		// TODO: Is it ok to assume ASCII is ok for adjustments?
		generateHashWord: function(
								siteTag,
								masterKey,
								hashWordSize,
								requireDigit,
								requirePunctuation,
								requireMixedCase,
								restrictSpecial,
								restrictDigits)
		{
				// Start with the SHA1-encrypted master key/site tag.
				var s = b64_hmac_sha1(masterKey, siteTag);
				// Use the checksum of all characters as a pseudo-randomizing seed to
				// avoid making the injected characters easy to guess.  Note that it
				// isn't random in the sense of not being deterministic (i.e.
				// repeatable).  Must share the same seed between all injected
				// characters so that they are guaranteed unique positions based on
				// their offsets.
				var sum = 0;
				for (var i = 0; i < s.length; i++)
						sum += s.charCodeAt(i);
				// Restrict digits just does a mod 10 of all the characters
				if (restrictDigits)
						s = PassHashCommon.convertToDigits(s, sum, hashWordSize);
				else
				{
						// Inject digit, punctuation, and mixed case as needed.
						if (requireDigit)
								s = PassHashCommon.injectSpecialCharacter(s, 0, 4, sum, hashWordSize, 48, 10);
						if (requirePunctuation && !restrictSpecial)
								s = PassHashCommon.injectSpecialCharacter(s, 1, 4, sum, hashWordSize, 33, 15);
						if (requireMixedCase)
						{
								s = PassHashCommon.injectSpecialCharacter(s, 2, 4, sum, hashWordSize, 65, 26);
								s = PassHashCommon.injectSpecialCharacter(s, 3, 4, sum, hashWordSize, 97, 26);
						}
						// Strip out special characters as needed.
						if (restrictSpecial)
								s = PassHashCommon.removeSpecialCharacters(s, sum, hashWordSize);
				}
				// Trim it to size.
				return s.substr(0, hashWordSize);
		},

		// This is a very specialized method to inject a character chosen from a
		// range of character codes into a block at the front of a string if one of
		// those characters is not already present.
		// Parameters:
		//  sInput   = input string
		//  offset   = offset for position of injected character
		//  reserved = # of offsets reserved for special characters
		//  seed     = seed for pseudo-randomizing the position and injected character
		//  lenOut   = length of head of string that will eventually survive truncation.
		//  cStart   = character code for first valid injected character.
		//  cNum     = number of valid character codes starting from cStart.
		injectSpecialCharacter: function(sInput, offset, reserved, seed, lenOut, cStart, cNum)
		{
				var pos0 = seed % lenOut;
				var pos = (pos0 + offset) % lenOut;
				// Check if a qualified character is already present
				// Write the loop so that the reserved block is ignored.
				for (var i = 0; i < lenOut - reserved; i++)
				{
						var i2 = (pos0 + reserved + i) % lenOut
						var c = sInput.charCodeAt(i2);
						if (c >= cStart && c < cStart + cNum)
								return sInput;  // Already present - nothing to do
				}
				var sHead   = (pos > 0 ? sInput.substring(0, pos) : "");
				var sInject = String.fromCharCode(((seed + sInput.charCodeAt(pos)) % cNum) + cStart);
				var sTail   = (pos + 1 < sInput.length ? sInput.substring(pos+1, sInput.length) : "");
				return (sHead + sInject + sTail);
		},

		// Another specialized method to replace a class of character, e.g.
		// punctuation, with plain letters and numbers.
		// Parameters:
		//  sInput = input string
		//  seed   = seed for pseudo-randomizing the position and injected character
		//  lenOut = length of head of string that will eventually survive truncation.
		removeSpecialCharacters: function(sInput, seed, lenOut)
		{
				var s = '';
				var i = 0;
				while (i < lenOut)
				{
						var j = sInput.substring(i).search(/[^a-z0-9]/i);
						if (j < 0)
								break;
						if (j > 0)
								s += sInput.substring(i, i + j);
						s += String.fromCharCode((seed + i) % 26 + 65);
						i += (j + 1);
				}
				if (i < sInput.length)
						s += sInput.substring(i);
				return s;
		},

		// Convert input string to digits-only.
		// Parameters:
		//  sInput = input string
		//  seed   = seed for pseudo-randomizing the position and injected character
		//  lenOut = length of head of string that will eventually survive truncation.
		convertToDigits: function(sInput, seed, lenOut)
		{
				var s = '';
				var i = 0;
				while (i < lenOut)
				{
						var j = sInput.substring(i).search(/[^0-9]/i);
						if (j < 0)
								break;
						if (j > 0)
								s += sInput.substring(i, i + j);
						s += String.fromCharCode((seed + sInput.charCodeAt(i)) % 10 + 48);
						i += (j + 1);
				}
				if (i < sInput.length)
						s += sInput.substring(i);
				return s;
		},

}
