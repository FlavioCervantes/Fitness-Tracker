CREATE TABLE `users` (
    `userId` mediumint(9) NOT NULL AUTO_INCREMENT,
    `host` varchar(255) COLLATE utf8_unicode_ci NOT NULL UNIQUE,
    `user` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
    `password` varchar(100) COLLATE utf8_unicode_ci NOT NULL UNIQUE,
    `database` varchar(50) COLLATE utf8_unicode_ci NOT NULL, 
    PRIMARY KEY (`userId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `users` (`userId`, `host`, `user`, `password`, `database`) 
VALUES (1, 'host', 'user1', 'password123', 'db');