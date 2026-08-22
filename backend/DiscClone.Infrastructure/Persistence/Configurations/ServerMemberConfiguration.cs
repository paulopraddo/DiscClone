using DiscClone.Domain.Servers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscClone.Infrastructure.Persistence.Configurations;

public sealed class ServerMemberConfiguration : IEntityTypeConfiguration<ServerMember>
{
    public void Configure(EntityTypeBuilder<ServerMember> builder)
    {
        builder.ToTable("server_members");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.ServerId)
            .HasColumnName("server_id")
            .IsRequired();

        builder.Property(m => m.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(m => m.JoinedAt)
            .HasColumnName("joined_at")
            .IsRequired();

        builder.HasIndex(m => new { m.ServerId, m.UserId }).IsUnique();
    }
}
