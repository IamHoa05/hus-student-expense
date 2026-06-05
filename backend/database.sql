INSERT INTO category (category_id, category_name, user_id, transaction_type, icon, is_system) VALUES 
(1, 'Ăn uống', null, 'OUTFLOW', 'restaurant', true),
(2, 'Học tập', null, 'OUTFLOW', 'school', true),
(3, 'Di chuyển', null, 'OUTFLOW', 'directions_bus', true),
(4, 'Dịch vụ', null, 'OUTFLOW', 'settings_suggest', true),
(5, 'Mua sắm', null, 'OUTFLOW', 'shopping_bag', true),
(6, 'Giải trí', null, 'OUTFLOW', 'sports_esports', true),
(7, 'Sức khỏe', null, 'OUTFLOW', 'favorite', true),
(8, 'Cố định', null, 'OUTFLOW', 'home_work', true),
(9, 'Khác', null, 'OUTFLOW', 'more_horiz', true),
(10, 'Lương', null, 'INFLOW', 'payments', true),
(11, 'Thưởng', null, 'INFLOW', 'card_giftcard', true),
(12, 'Tiền tiêu vặt', null, 'INFLOW', 'savings', true),
(13, 'Thu nhập khác', null, 'INFLOW', 'account_balance', true)
ON CONFLICT (category_id) DO NOTHING;