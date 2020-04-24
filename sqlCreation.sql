
-- -----------------------------------------------------
-- Schema s23q3vq9vq9gral6
-- -----------------------------------------------------
USE `s23q3vq9vq9gral6` ;

-- -----------------------------------------------------
-- Table `s23q3vq9vq9gral6`.`maker`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `s23q3vq9vq9gral6`.`maker` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45) NOT NULL,
  `time_sheet_id` INT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `ID_UNIQUE` (`id` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `s23q3vq9vq9gral6`.`client`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `s23q3vq9vq9gral6`.`client` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `location` VARCHAR(45) NULL,
  `remaining_hours` DECIMAL NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `ID_UNIQUE` (`id` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `s23q3vq9vq9gral6`.`time_sheet`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `s23q3vq9vq9gral6`.`time_sheet` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `maker_id` INT NOT NULL,
  `client_id` INT NOT NULL,
  `hourly_rate` DECIMAL NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `occupation` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `ID_UNIQUE` (`id` ASC),
  INDEX `maker_id_idx` (`maker_id` ASC),
  INDEX `client_time_fk_idx` (`client_id` ASC),
  CONSTRAINT `maker_time_fk`
    FOREIGN KEY (`maker_id`)
    REFERENCES `s23q3vq9vq9gral6`.`maker` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `client_time_fk`
    FOREIGN KEY (`client_id`)
    REFERENCES `s23q3vq9vq9gral6`.`client` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
