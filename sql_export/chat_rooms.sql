create table chat_rooms
(
    id         uuid default gen_random_uuid() not null
        primary key,
    name       text                           not null,
    type       text                           not null
        constraint chk_chat_rooms_type
            check (type = ANY (ARRAY ['direct'::text, 'group'::text])),
    created_by uuid                           not null
        constraint fk_chat_rooms_creator
            references users,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);

alter table chat_rooms
    owner to postgres;

INSERT INTO public.chat_rooms (id, name, type, created_by, created_at, updated_at) VALUES ('773a010c-ede5-4c2a-aef9-5636fb6faab4', 'Chat with Seller', 'direct', 'e7bc18d6-d874-4691-a320-03aca6b87652', '2025-06-17 19:38:42.366961 +00:00', '2025-06-17 19:38:42.366961 +00:00');
INSERT INTO public.chat_rooms (id, name, type, created_by, created_at, updated_at) VALUES ('a1257617-4f9e-43ef-a76e-2987143882e7', 'Chat with Seller', 'direct', '46a0e047-503b-4d32-8e62-acbf0b5a7ca2', '2025-06-17 19:39:44.879226 +00:00', '2025-06-17 19:39:44.879226 +00:00');
INSERT INTO public.chat_rooms (id, name, type, created_by, created_at, updated_at) VALUES ('35696682-dec5-4aa1-827e-add234430a5a', 'Chat with Seller', 'direct', 'e7bc18d6-d874-4691-a320-03aca6b87652', '2025-06-17 19:40:18.353030 +00:00', '2025-06-17 19:40:18.353030 +00:00');
INSERT INTO public.chat_rooms (id, name, type, created_by, created_at, updated_at) VALUES ('4b661387-3d1f-4d97-aa6d-739ec2237f67', 'Chat about Product', 'direct', '46a0e047-503b-4d32-8e62-acbf0b5a7ca2', '2025-06-17 19:41:54.716941 +00:00', '2025-06-17 19:41:54.716941 +00:00');
INSERT INTO public.chat_rooms (id, name, type, created_by, created_at, updated_at) VALUES ('857cd7bd-df60-4298-9c03-2120ac52afca', 'Chat about Product (Product 4d32)', 'direct', 'e7bc18d6-d874-4691-a320-03aca6b87652', '2025-06-17 19:42:40.577465 +00:00', '2025-06-17 19:42:40.577465 +00:00');
INSERT INTO public.chat_rooms (id, name, type, created_by, created_at, updated_at) VALUES ('722f7ac9-ee2e-4aa4-9f29-25601ffb737d', 'Chat about Product (Product 4d32)', 'direct', '46a0e047-503b-4d32-8e62-acbf0b5a7ca2', '2025-06-17 19:43:15.073586 +00:00', '2025-06-17 19:48:34.004957 +00:00');
INSERT INTO public.chat_rooms (id, name, type, created_by, created_at, updated_at) VALUES ('0c75ce03-614f-4a7c-9ffa-33fde8fc4f69', 'Chat with Seller', 'direct', 'e7bc18d6-d874-4691-a320-03aca6b87652', '2025-06-17 19:38:42.366962 +00:00', '2025-06-17 19:38:50.604979 +00:00');
INSERT INTO public.chat_rooms (id, name, type, created_by, created_at, updated_at) VALUES ('8d85db71-0ce1-4818-95f7-e362f9b13f6d', 'Chat with Seller', 'direct', '46a0e047-503b-4d32-8e62-acbf0b5a7ca2', '2025-06-17 19:39:44.879248 +00:00', '2025-06-17 19:39:44.879248 +00:00');
INSERT INTO public.chat_rooms (id, name, type, created_by, created_at, updated_at) VALUES ('c32891f2-1812-4bf8-b933-be8cf4c02ef7', 'Chat with Seller', 'direct', 'e7bc18d6-d874-4691-a320-03aca6b87652', '2025-06-17 19:40:18.353030 +00:00', '2025-06-17 19:40:18.353030 +00:00');
INSERT INTO public.chat_rooms (id, name, type, created_by, created_at, updated_at) VALUES ('83d24e2f-0681-446e-b6ed-d621001ce546', 'Chat about Product', 'direct', 'e7bc18d6-d874-4691-a320-03aca6b87652', '2025-06-17 19:41:54.984152 +00:00', '2025-06-17 19:41:54.984152 +00:00');
INSERT INTO public.chat_rooms (id, name, type, created_by, created_at, updated_at) VALUES ('f4ff6b92-e054-454e-babd-d9a93b82e863', 'Chat about Product (Product 4d32)', 'direct', 'e7bc18d6-d874-4691-a320-03aca6b87652', '2025-06-17 19:42:40.573402 +00:00', '2025-06-17 19:42:49.205701 +00:00');
INSERT INTO public.chat_rooms (id, name, type, created_by, created_at, updated_at) VALUES ('8a78f450-b1d0-4d12-a13b-23e582021b8b', 'Chat about Product (Product 4d32)', 'direct', '46a0e047-503b-4d32-8e62-acbf0b5a7ca2', '2025-06-17 19:43:15.074451 +00:00', '2025-06-17 19:43:15.074451 +00:00');
INSERT INTO public.chat_rooms (id, name, type, created_by, created_at, updated_at) VALUES ('5f8c5062-a2b0-47e3-914a-4ab9cee28c5a', 'Chat about Product (Product Product)', 'direct', 'e7bc18d6-d874-4691-a320-03aca6b87652', '2025-06-17 20:03:29.519557 +00:00', '2025-06-17 20:03:29.519557 +00:00');
INSERT INTO public.chat_rooms (id, name, type, created_by, created_at, updated_at) VALUES ('f03b9d0f-79a2-4b23-9971-7cd7ad1188ac', 'Chat about Product (Product Product)', 'direct', 'e7bc18d6-d874-4691-a320-03aca6b87652', '2025-06-17 20:03:29.646187 +00:00', '2025-06-17 20:03:29.646187 +00:00');
INSERT INTO public.chat_rooms (id, name, type, created_by, created_at, updated_at) VALUES ('7e2a89d9-7861-41e0-b3fd-5510a559b62d', 'Chat about Pad do xbox''a', 'direct', 'e7bc18d6-d874-4691-a320-03aca6b87652', '2025-06-17 22:08:00.989008 +00:00', '2025-06-17 22:08:00.989008 +00:00');
INSERT INTO public.chat_rooms (id, name, type, created_by, created_at, updated_at) VALUES ('64ae9a61-558a-4c55-b185-0532840d4d59', 'Chat about Pad do xbox''a', 'direct', 'd9a76988-e0d1-4e68-901b-6780c3ca233d', '2025-06-17 22:09:03.725126 +00:00', '2025-06-17 22:09:03.725126 +00:00');
INSERT INTO public.chat_rooms (id, name, type, created_by, created_at, updated_at) VALUES ('1369d9be-eabe-41e6-8438-4c9a5995d8a8', 'Chat about Pad do xbox''a', 'direct', 'd9a76988-e0d1-4e68-901b-6780c3ca233d', '2025-06-17 22:09:03.726994 +00:00', '2025-06-17 22:09:18.707597 +00:00');
INSERT INTO public.chat_rooms (id, name, type, created_by, created_at, updated_at) VALUES ('39fad217-5ee8-43ed-b353-35241a3c4ae9', 'Chat about Bilet na Red Hot Chili Peppers', 'direct', '46a0e047-503b-4d32-8e62-acbf0b5a7ca2', '2025-06-19 17:51:09.615337 +00:00', '2025-06-19 17:51:09.615337 +00:00');
INSERT INTO public.chat_rooms (id, name, type, created_by, created_at, updated_at) VALUES ('2a4ef366-5d8b-4157-b247-6f506493a35a', 'Chat about Bilet na Red Hot Chili Peppers', 'direct', '46a0e047-503b-4d32-8e62-acbf0b5a7ca2', '2025-06-19 17:51:09.615341 +00:00', '2025-06-19 17:51:09.615341 +00:00');
INSERT INTO public.chat_rooms (id, name, type, created_by, created_at, updated_at) VALUES ('6570193c-5fbb-4a25-aac9-95cad3f2c7f4', 'Chat about Pad do xbox''a', 'direct', 'e7bc18d6-d874-4691-a320-03aca6b87652', '2025-06-17 22:08:01.055702 +00:00', '2025-06-19 18:13:05.326470 +00:00');
