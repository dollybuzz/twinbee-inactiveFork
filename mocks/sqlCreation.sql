
-- -----------------------------------------------------
-- Schema s23q3vq9vq9gral6
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema s23q3vq9vq9gral6
-- -----------------------------------------------------
USE `s23q3vq9vq9gral6` ;

-- -----------------------------------------------------
-- Table `s23q3vq9vq9gral6`.`client`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `s23q3vq9vq9gral6`.`client` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `location` VARCHAR(45) NULL DEFAULT NULL,
  `remaining_hours` DECIMAL(10,2) NOT NULL,
  `email` VARCHAR(50) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `ID_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci;


-- -----------------------------------------------------
-- Table `s23q3vq9vq9gral6`.`maker`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `s23q3vq9vq9gral6`.`maker` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45) NOT NULL,
  `email` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `ID_UNIQUE` (`id` ASC) )
ENGINE = InnoDB
AUTO_INCREMENT = 7
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci;


-- -----------------------------------------------------
-- Table `s23q3vq9vq9gral6`.`time_sheet`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `s23q3vq9vq9gral6`.`time_sheet` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `maker_id` INT(11) NOT NULL,
  `client_id` INT(11) NOT NULL,
  `hourly_rate` DECIMAL(10,2) NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `task` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `ID_UNIQUE` (`id` ASC) ,
  INDEX `maker_id_idx` (`maker_id` ASC) ,
  INDEX `client_time_fk_idx` (`client_id` ASC) ,
  CONSTRAINT `client_time_fk`
    FOREIGN KEY (`client_id`)
    REFERENCES `s23q3vq9vq9gral6`.`client` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `maker_time_fk`
    FOREIGN KEY (`maker_id`)
    REFERENCES `s23q3vq9vq9gral6`.`maker` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
