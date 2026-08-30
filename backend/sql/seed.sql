-- ============================================================
-- Seed data — run AFTER schema.sql, so you have data to test with
-- ============================================================

insert into membership_plans (plan_code, name, price, duration_days, renewal_rate, status, features) values
('PLN-001', 'Premium', 4999, 30, 92, 'active', '["Access to all gym equipment","Unlimited group classes","2 Personal training sessions/mo","Premium locker room access","Guest pass (1 per month)"]'),
('PLN-002', 'Standard', 2499, 30, 89, 'active', '["Access to all gym equipment","Unlimited group classes"]'),
('PLN-003', 'Basic', 1199, 30, 85, 'inactive', '["Access to gym equipment"]'),
('PLN-004', 'Quarterly', 11999, 90, 90, 'active', '["Access to all gym equipment","Unlimited group classes"]'),
('PLN-005', 'Half Yearly', 18999, 180, 88, 'active', '["Access to all gym equipment","Unlimited group classes","2 Personal training sessions/mo"]'),
('PLN-006', 'Yearly', 34999, 365, 95, 'active', '["Access to all gym equipment","Unlimited group classes","2 Personal training sessions/mo","Premium locker room access"]');

insert into trainers (trainer_code, name, email, phone, specialization, experience_years, rating, status) values
('TR-204', 'Marcus Thompson', 'm.thompson@fitcore.com', '+1 555 123 4567', 'Strength & Conditioning', 8, 4.8, 'active'),
('TR-201', 'Sophia Lee', 'sophia@example.com', '+1 555 234 5678', 'Yoga & Flexibility', 5, 4.6, 'active'),
('TR-202', 'Daniel Kim', 'daniel@example.com', '+1 555 345 6789', 'Cardio & HIIT', 6, 4.5, 'active'),
('TR-203', 'Laura Martinez', 'laura@example.com', '+1 555 456 7890', 'Pilates', 4, 4.7, 'active'),
('TR-200', 'Ryan Cooper', 'ryan@example.com', '+1 555 567 8901', 'CrossFit', 7, 4.4, 'inactive');

-- Members reference trainers/plans by lookup since UUIDs are generated at insert time
insert into members (member_code, name, email, phone, gender, plan_id, trainer_id, status, join_date, expiry_date)
select 'FT-1024', 'Alex Johnson', 'alex.johnson@email.com', '(555) 123-4567', 'Male',
  (select id from membership_plans where plan_code = 'PLN-001'),
  (select id from trainers where trainer_code = 'TR-204'),
  'active', '2024-08-15', '2024-09-14';

insert into members (member_code, name, email, phone, gender, plan_id, trainer_id, status, join_date, expiry_date)
select 'FT-1025', 'Maria Garcia', 'maria@example.com', '(555) 234-5678', 'Female',
  (select id from membership_plans where plan_code = 'PLN-002'),
  (select id from trainers where trainer_code = 'TR-201'),
  'active', '2024-08-14', '2024-09-13';

insert into members (member_code, name, email, phone, gender, plan_id, trainer_id, status, join_date, expiry_date)
select 'FT-1020', 'David Miller', 'david@example.com', '(555) 345-6789', 'Male',
  (select id from membership_plans where plan_code = 'PLN-002'),
  (select id from trainers where trainer_code = 'TR-204'),
  'inactive', '2024-08-05', '2024-09-04';

insert into staff (staff_code, name, role_title, department, email, phone, status, join_date) values
('ST-124', 'Emily Carter', 'Administrator', 'Management', 'emily@example.com', '+91 91234 56789', 'active', '2022-01-10'),
('ST-135', 'Michael Brown', 'Head Trainer', 'Trainers', 'michael@example.com', '+91 98765 43210', 'active', '2022-03-15'),
('ST-142', 'Jessica Lee', 'Receptionist', 'Front Desk', 'jessica@example.com', '+91 99887 76655', 'on_leave', '2022-08-01');

insert into leads (name, email, phone, source, interest, status, last_contact) values
('John Doe', 'john.doe@example.com', '+91 90000 00001', 'website', 'Personal Training', 'new', now() - interval '2 hours'),
('Sarah Smith', 'sarah.s@example.com', '+91 90000 00002', 'walk_in', 'Yoga Classes', 'contacted', now() - interval '1 day'),
('Mike Ross', 'm.ross@example.com', '+91 90000 00003', 'referral', 'General Membership', 'in_progress', now() - interval '3 days'),
('David Chen', 'd.chen@example.com', '+91 90000 00004', 'website', 'HIIT', 'converted', now() - interval '7 days');

insert into classes (name, trainer_id, scheduled_at, duration_minutes, capacity, booked_count, status)
select 'Morning Strength', (select id from trainers where trainer_code='TR-204'), now() + interval '1 day', 60, 20, 18, 'scheduled';

insert into classes (name, trainer_id, scheduled_at, duration_minutes, capacity, booked_count, status)
select 'Yoga Flow', (select id from trainers where trainer_code='TR-201'), now() + interval '1 day' + interval '90 min', 60, 15, 12, 'scheduled';

insert into classes (name, trainer_id, scheduled_at, duration_minutes, capacity, booked_count, status)
select 'HIIT Blast', (select id from trainers where trainer_code='TR-202'), now() + interval '1 day' + interval '150 min', 45, 25, 25, 'full';

insert into payments (transaction_code, member_id, plan_id, amount, method, status, paid_at)
select 'TX1042', (select id from members where member_code='FT-1024'), (select id from membership_plans where plan_code='PLN-001'), 1200.00, 'card', 'paid', now() - interval '1 day';

insert into payments (transaction_code, member_id, plan_id, amount, method, status, paid_at)
select 'TX1041', (select id from members where member_code='FT-1025'), (select id from membership_plans where plan_code='PLN-002'), 45.00, 'bank_transfer', 'pending', now() - interval '1 day';

insert into activity_log (category, title, description, is_read) values
('registration', 'Alex Johnson joined the gym', 'New Annual Premium membership created via online portal.', false),
('payment', 'Membership renewal for Sarah Brown processed', '$120.00 collected successfully to Visa ending in 4242.', false),
('schedule', 'Yoga Flow class time updated', 'Moved from 5:00 PM to 6:00 PM. 12 members notified.', true),
('system', 'New staff member Emily Carter added', 'Role assigned: Front Desk Associate.', true);
