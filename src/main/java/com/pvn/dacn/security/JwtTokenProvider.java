package com.pvn.dacn.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails; // Cập nhật import cho UserDetails
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    // 1. DÙNG CHUỖI CỐ ĐỊNH (Thay vì sinh ngẫu nhiên mỗi lần chạy)
    // Chuỗi này phải đủ dài (ít nhất 64 ký tự cho HS512)
    private final String JWT_SECRET_STRING = "DayLaChuoiBiMatSieuDaiDeBaoMatTokenCuaDuAnShopThuCung2025KhongDuocTietLoRaNgoaiNhe1234567890";

    // Thời gian hiệu lực: 10 ngày (864000000 ms)
    private final int jwtExpirationInMs = 864000000;

    // Helper tạo Key từ chuỗi cố định
    private SecretKey getSignInKey() {
        return Keys.hmacShaKeyFor(JWT_SECRET_STRING.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    // 2. Tạo Token
    public String generateToken(Authentication authentication) {
        // Lấy UserDetails từ Authentication (Spring Security chuẩn)
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(getSignInKey(), SignatureAlgorithm.HS512) // Dùng key cố định
                .compact();
    }

    // 3. Lấy Username từ Token
    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSignInKey()) // Dùng key cố định
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    // 4. Xác thực Token
    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSignInKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty.");
        }
        return false;
    }
}