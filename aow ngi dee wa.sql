create schema aowngaideewa;
use aowngaideewa;
create table user(
user_id int not null primary key,
user_name  varchar(35) not null,
first_name varchar(35) not null,
last_name varchar(35) not null,
user_email varchar(255) not null,
user_password varchar(255) not null);

create table place(
place_id int not null primary key,
place_name varchar(50) not null,
place_address varchar(255) not null,
place_province varchar(20) not null,
starting_price numeric(5) default 0 null,
opening_hours text null,
place_event text null,
place_score numeric(1,1) default 0 null);

create table category(
category_id int not null primary key,
category_name varchar(25) not null);

create table place_category(
place_id int not null,
category_id int not null,
primary key(place_id,category_id),
foreign key (place_id) references place(place_id),
foreign key (category_id) references category(category_id));

create table favorite(
favorite_id int not null primary key,
user_id int not null,
place_id int not null,
foreign key (user_id) references user(user_id),
foreign key (place_id) references place(place_id));

CREATE TABLE place_images (
    image_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    place_id INT NOT NULL,
    image_path VARCHAR(500) NOT NULL,      
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (place_id) REFERENCES place(place_id)
        ON DELETE CASCADE
);
INSERT INTO place_images (image_id, place_id, image_path) VALUES
(1, 1001, 'project/img_place/images (1).jpg'),
(2, 1002, 'project/img_place/watpho_front.jpg'),
(3, 1003, 'project/img_place/e0b8a7e0b8b1e0b887-e1505234056426.jpg'),
(4, 1004, 'project/img_place/2351f6d3c313f525c4089bc84d2410bf.jpg'),
(5, 1005, 'project/img_place/shutterstock_549521977-825x550.jpg'),
(6, 1006, 'project/img_place/iconsiam.jpg'),
(7, 1007, 'project/img_place/apply-tourist-card-to.jpg'),
(8, 1008, 'project/img_place/eb85ca00-df68-11ed-81c8-271696819d88_webp_original.jpg'),
(9, 1009, 'project/img_place/5c11f790-08a9-11ed-b3fc-174b6eee67bf_webp_original.jpg'),
(10, 1010, 'project/img_place/TheMO-BACC_cover.jpg'),
(11, 1011, 'project/img_place/caf88b0a-6bd5-407f-b89d-09bd85b42211_0.jpg'),
(12, 1012, 'project/img_place/อุทยานประวัติศาสตร์พระนครศรีอยุธยา_จังหวัดพระนครศรีอยุธยา.JPG.jpg'),
(13, 1013, 'project/img_place/วัดมหาธาตุ-อยุธยา.jpg'),
(14, 1014, 'project/img_place/IMG_20171002_093423-1024x768.jpg'),
(15, 1015, 'project/img_place/55a03730-068e-11ee-b704-e11b1c7d3a39_webp_original.jpg'),
(16, 1016, 'project/img_place/4e2ab2e0-44d7-11ea-ae38-73538266b6f9_original.jpg'),
(17, 1017, 'project/img_place/4c569c00-db5f-7bb2-7a81-523fe306b1c2.jpg'),
(18, 1018, 'project/img_place/348d9fc0-cc41-11ec-96f4-69b6cdc032b9_webp_original.jpg'),
(19, 1019, 'project/img_place/4-3_1.jpg'),
(20, 1020, 'project/img_place/the-main-entrance-to.jpg');

select * from place_images;


 
